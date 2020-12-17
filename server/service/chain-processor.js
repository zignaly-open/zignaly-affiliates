import moment from 'moment';
import Chain from '../model/chain';
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

const toCents = amount => Math.round(amount * 100);

export function calculateAffiliateReward(campaign, payments) {
  switch (campaign.serviceType) {
    case SERVICE_TYPES.MONTHLY_FEE: {
      const totalMonths = payments.reduce(
        (sum, { quantity }) => sum + +quantity || 1,
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
        (sum, x) => sum + ((+x.amount || 0) * campaign.rewardValue) / 100,
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
  if (!campaign || !affiliate) return;
  const reward = calculateAffiliateReward(campaign, payments);
  return {
    affiliate,
    campaign,
    merchant: campaign.merchant,
    totalPaid: toCents(
      payments.reduce((sum, { amount }) => sum + (+amount || 0), 0),
    ),
    affiliateReward: toCents(reward),
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
