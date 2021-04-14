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
}) => {
  const exactMatch = await getMerchantExactMatch({
    campaignId,
    serviceId,
    affiliateId,
  });
  if (exactMatch) return exactMatch;
  const { merchant } = await Campaign.findOne({ zignalyServiceIds: serviceId });
  if (
    await isAffiliateOnAtLeastOneCampaign({ merchant, affiliate: affiliateId })
  ) {
    return getMerchantDefaultCampaign(merchant);
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

const isAffiliateOnAtLeastOneCampaign = async ({ merchant, affiliate }) =>
  !!(await Campaign.findOne({
    merchant,
    'affiliates.user': affiliate,
  }));

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
          Math.ceil(
            moment(profitSharingPayments[payments.length - 1].event_date).diff(
              profitSharingPayments[0].event_date,
              'months',
              true,
            ),
          ),
        );
      const limit = +campaign.rewardDurationMonths;
      return (
        (limit ? Math.min(totalMonths, limit) : totalMonths) *
        campaign.rewardValue
      );
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

      return paymentsEntitledTo.reduce(
        // so, on one hand the amount is min dollars, so needs to be multiplied by 100
        // on the other hand, percents are between 0 and 100
        (sum, x) => sum + (+x.amount || 0) * campaign.rewardValue,
        0,
      );
    }
    default:
      throw new Error(
        `Unexpected campaign reward type: ${campaign.serviceType}`,
      );
  }
}

export async function getChainData({ visit, payments }) {
  const affiliate = await detectAffiliateByAffiliateId(visit.affiliate_id);
  const campaign = await detectCampaign({
    campaignId: visit.campaign_id,
    serviceId: payments[0].service_id,
    affiliateId: visit.affiliate_id,
  });

  if (!campaign || !affiliate) return;
  const externalUserId = payments[0].user_id;
  const dispute = await detectExistingDispute(
    externalUserId,
    campaign,
    affiliate,
  );
  const reward = calculateAffiliateReward(campaign, payments);
  return {
    affiliate,
    externalUserId,
    campaign,
    dispute,
    merchant: campaign.merchant,
    totalPaid:
      100 * payments.reduce((sum, { amount }) => sum + (+amount || 0), 0),
    affiliateReward: reward,
    visit: {
      id: visit.event_id,
      date: visit.event_date,
      subtrack: visit.sub_track_id,
    },
  };
}

export default async function processChain({ visit, payments }) {
  if (payments.length === 0) return;
  const data = await getChainData({ visit, payments });
  if (data) await new Chain(data).save();
}
