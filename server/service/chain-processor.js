import moment from 'moment';
import Chain from '../model/chain';
import Dispute from '../model/dispute';
import Campaign, { SERVICE_TYPES } from '../model/campaign';
import User, { USER_ROLES } from '../model/user';

export const detectCampaign = async ({
  campaignId,
  serviceId,
  affiliateId,
  moneyInvested,
  hasNoPriorConnections,
  externalMerchantId,
}) => {
  const exactMatch = await getMerchantExactMatch({
    campaignId,
    serviceId,
    affiliateId,
  });
  if (exactMatch) return exactMatch;

  const campaignForServicesHeSignedUpTo = await Campaign.findOne({
    zignalyServiceIds: serviceId,
    deletedAt: null,
  }).lean();

  const campaignForServicesHeWasSupposedToSignUpTo = await Campaign.findOne({
    _id: campaignId,
  }).lean();

  if (
    campaignForServicesHeSignedUpTo &&
    campaignForServicesHeSignedUpTo.merchant.toString() ===
      campaignForServicesHeWasSupposedToSignUpTo?.merchant.toString()
  ) {
    return campaignForServicesHeSignedUpTo;
  }

  const serviceIdBelongsToSameMerchant =
    externalMerchantId &&
    !!(await User.findOne({
      zignalyId: externalMerchantId,
      _id: campaignForServicesHeWasSupposedToSignUpTo?.merchant,
    }));

  if (!campaignForServicesHeSignedUpTo && serviceIdBelongsToSameMerchant) {
    // this is the case when the campaign is either deleted or was never a part of Zignaly Affiliate
    return getMerchantDefaultCampaign(
      campaignForServicesHeWasSupposedToSignUpTo.merchant,
    );
  }

  return getZignalyCampaignIfEligible({
    moneyInvested,
    hasNoPriorConnections,
  });
};

const detectAffiliateByAffiliateId = affiliateId =>
  User.findOne({
    _id: affiliateId,
    role: USER_ROLES.AFFILIATE,
  });

export function detectExistingDispute(externalUserId, campaign, affiliate) {
  return Dispute.findOne({
    externalUserId,
    campaign,
    affiliate,
  });
}

const getMerchantExactMatch = ({ campaignId, serviceId, affiliateId }) =>
  Campaign.findOne({
    _id: campaignId,
    zignalyServiceIds: serviceId,
    'affiliates.user': affiliateId,
  });

const getMerchantDefaultCampaign = merchant =>
  Campaign.findOne({
    isDefault: true,
    merchant,
  });

const getZignalyCampaignIfEligible = async ({
  hasNoPriorConnections,
  moneyInvested,
}) =>
  hasNoPriorConnections &&
  Campaign.findOne({
    isSystem: true,
    investedThreshold: {
      $gt: 0,
      $lte: moneyInvested,
    },
  });

export function calculateAffiliateReward(campaign, payments) {
  if (payments.length === 0) return { base: 0, value: 0 };
  switch (campaign.serviceType) {
    case SERVICE_TYPES.MONTHLY_FEE: {
      let totalMonths = payments
        .filter(x => x.payment_type === 'coinPayments')
        .reduce((sum, { quantity }) => sum + (+quantity || 1), 0);
      const profitSharingPayments = payments.filter(
        x => x.payment_type === 'profitSharing',
      );
      if (profitSharingPayments.length > 0)
        totalMonths = Math.max(
          totalMonths,
          1,
          Math.ceil(
            moment(profitSharingPayments[payments.length - 1].event_date).diff(
              profitSharingPayments[0].event_date,
              'months',
              true,
            ),
          ),
        );
      const limit = +campaign.rewardDurationMonths;
      const base = limit ? Math.min(totalMonths, limit) : totalMonths;
      return {
        base,
        value: base * campaign.rewardValue,
      };
    }
    case SERVICE_TYPES.PROFIT_SHARING: {
      // both profitsharing payments and subscription payments
      let paymentsEntitledTo = payments.slice(0);
      if (+campaign.rewardDurationMonths) {
        const max = moment(payments[0].event_date).add(
          campaign.rewardDurationMonths,
          'month',
        );
        paymentsEntitledTo = paymentsEntitledTo.filter(({ event_date: date }) =>
          moment(date).isBefore(max),
        );
      }

      const base = paymentsEntitledTo.reduce(
        // so, on one hand the amount is min dollars, so needs to be multiplied by 100
        // on the other hand, percents are between 0 and 100
        (sum, x) => sum + (+x.amount || 0),
        0,
      );
      return {
        base,
        value: base * campaign.rewardValue,
      };
    }
    default:
      throw new Error(
        `Unexpected campaign reward type: ${campaign.serviceType}`,
      );
  }
}

export function calculateIncrementalAffiliateReward(
  previousReward,
  campaign,
  payments,
) {
  const { base } = calculateAffiliateReward(campaign, payments);
  const { value: previousValue, base: previousBase } = previousReward;
  return {
    base,
    value: previousValue + (base - previousBase) * campaign.rewardValue,
  };
}

async function createNewChain(chain, userInfo) {
  const {
    visit,
    payments,
    connectDate,
    merchantId: externalMerchantId,
    userId: externalUserId,
    serviceId,
  } = chain;
  const affiliate = await detectAffiliateByAffiliateId(visit.affiliate_id);
  const campaign = await detectCampaign({
    moneyInvested: userInfo?.moneyInvested || 0,
    hasNoPriorConnections: +userInfo?.firstConnectDate === +connectDate,
    campaignId: visit.campaign_id,
    serviceId,
    affiliateId: visit.affiliate_id,
    externalMerchantId,
  });

  if (!campaign || !affiliate) return;

  const dispute = await detectExistingDispute(
    externalUserId,
    campaign,
    affiliate,
  );
  const { value, base } = calculateAffiliateReward(campaign, payments);
  await new Chain({
    affiliate,
    externalUserId,
    externalServiceId: serviceId,
    campaign,
    dispute,
    merchant: campaign.merchant,
    totalPaid:
      100 * payments.reduce((sum, { amount }) => sum + (+amount || 0), 0),
    affiliateReward: value,
    affiliateRewardBase: base,
    visit: {
      id: visit.event_id,
      date: visit.event_date,
      subtrack: visit.sub_track_id,
    },
  }).save();
}

async function updateExistingChain(existingChain, chain) {
  const { payments } = chain;
  const campaign = await Campaign.findOne({
    _id: existingChain.campaign,
  });
  const { value, base } = calculateIncrementalAffiliateReward(
    {
      value: existingChain.affiliateReward,
      base: existingChain.affiliateRewardBase,
    },
    campaign,
    payments,
  );
  /* eslint-disable no-param-reassign */
  existingChain.totalPaid =
    100 * payments.reduce((sum, { amount }) => sum + (+amount || 0), 0);
  existingChain.affiliateReward = value;
  existingChain.affiliateRewardBase = base;
  await existingChain.save();
}

export async function processChainDataIntoDatabase(chain, userInfo) {
  const { userId, serviceId } = chain;
  const existingChain = await Chain.findOne({
    externalServiceId: serviceId,
    externalUserId: userId,
  });
  if (existingChain) {
    if (typeof existingChain.affiliateRewardBase !== 'number') {
      // 2 options: it is either a migration in progress, i.e. a chain saved by an old version of the script
      // or smth really really bad happened
      // and there's no good way of telling one from another
      // sp let's hope for the best
      await existingChain.remove();
      await createNewChain(chain, userInfo);
    } else {
      await updateExistingChain(existingChain, chain);
    }
  } else await createNewChain(chain, userInfo);
}

export default async function processChain(chain, userInfo) {
  // now we want to find an existing chain and upd stuff in it
  await processChainDataIntoDatabase(chain, userInfo);
}
