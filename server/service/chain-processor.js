import moment from 'moment';
import Chain from '../model/chain';
import Dispute from '../model/dispute';
import Campaign, { SERVICE_TYPES } from '../model/campaign';
import User, { USER_ROLES } from '../model/user';

const detectTheRightVisitAndCampaign = async (visits, serviceId) => {
  const campaigns = await Campaign.find(
    {
      zignalyServiceIds: serviceId,
    },
    'affiliates',
  ).lean();

  const campaignIdToUsersMap = campaigns.reduce((memo, { _id, affiliates }) => {
    // eslint-disable-next-line no-param-reassign
    if (affiliates) memo[`${_id}`] = affiliates.map(x => `${x.user}`);
    return memo;
  }, {});
  const visit = visits.find(
    ({ campaign_id: campaignId, affiliate_id: affiliateId }) =>
      campaignIdToUsersMap[campaignId]?.indexOf(affiliateId) > -1,
  );
  return {
    visit,
    campaign: visit && (await Campaign.findOne({ _id: visit.campaign_id })),
  };
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

export function calculateAffiliateReward(campaign, payments) {
  switch (campaign.serviceType) {
    case SERVICE_TYPES.MONTHLY_FEE: {
      const totalMonths = payments.reduce(
        (sum, { quantity }) => sum + (+quantity || 1),
        0,
      );
      const limit = +campaign.rewardDurationMonths;
      return (
        (limit ? Math.min(totalMonths, limit) : totalMonths) *
        campaign.rewardValue
      );
    }
    case SERVICE_TYPES.PROFIT_SHARING: {
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
        `Unexpected campaign service type: ${campaign.serviceType}`,
      );
  }
}

export async function getChainData({ visits, payments }) {
  // I as a user click affiliate link, go to a campaign, a visit is counted. Let this be campaign C1, service S1, affiliate A1, pays but later
  // But before he pays, he clicks another link to campaign C2, service S2. aff A2 and closes it
  // Now what? we have a payment with service_id B2 and user_id U0. Fine. Now we want to find the visit to get the campaign id and affiliate id.
  // For that we search for all trackers with user_id = U0. The last event on that tracker is C2 S2 A2, so we attribute there
  // but guess what, we come here and try to find a campaign where to put C2, A2 and S1 (since it comes from the payment)

  // so from the visits array we gotta clear out all visits for campaigns that could not have triggered this conversion

  const { visit, campaign } = await detectTheRightVisitAndCampaign(
    visits,
    payments[0].service_id,
  );
  // eslint-disable-next-line no-console
  console.log(
    `service_id ${payments[0].service_id} ${
      visit
        ? 'CHECK'
        : `not found, ${visits.length} visits, 1st for campaign ${visits[0].campaign_id} aff ${visits[0].affiliate_id}`
    }`,
  );
  if (!visit) return;
  const affiliate = await detectAffiliateByAffiliateId(visit.affiliate_id);
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

export default async function processChain({ visits, payments }) {
  if (payments.length === 0) return;
  const data = await getChainData({ visits, payments });
  if (data) await new Chain(data).save();
}
