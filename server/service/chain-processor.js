import moment from 'moment';
import Chain from '../model/chain';
import Dispute from '../model/dispute';
import Campaign, { SERVICE_TYPES } from '../model/campaign';
import User, { USER_ROLES } from '../model/user';

const detectCampaign = ({ campaignId, serviceId, affiliateId }) =>
  Campaign.findOne({
    _id: campaignId,
    zignalyServiceIds: serviceId,
    'affiliates.user': affiliateId,
  });

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

export async function getChainData({ visit, payments }) {
  const affiliate = await detectAffiliateByAffiliateId(visit.affiliate_id);
  const campaign = await detectCampaign({
    campaignId: visit.campaign_id,
    serviceId: payments[0].service_id,
    affiliateId: visit.affiliate_id,
  });
  console.log('Looking for affiliate with id ' + visit.affiliate_id + ' and campaign with ' + JSON.stringify({
    campaignId: visit.campaign_id,
    serviceId: payments[0].service_id,
    affiliateId: visit.affiliate_id,
  }), !!campaign, !!affiliate);
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
