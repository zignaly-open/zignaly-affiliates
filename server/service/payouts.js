import Mongoose from 'mongoose';
import Payout, { PAYOUT_STATUSES } from '../model/payout';
import Chain from '../model/chain';
import Campaign from '../model/campaign';
import { getAffiliateEarningsByCampaign } from './statistics';

export async function createPendingPayouts() {
  const paid = await Payout.aggregate([
    {
      $match: {
        status: { $in: [PAYOUT_STATUSES.REQUESTED, PAYOUT_STATUSES.PAID] },
      },
    },
    {
      $group: {
        _id: { affiliate: '$affiliate', campaign: '$campaign' },
        total: { $sum: '$amount' },
      },
    },
    {
      $addFields: {
        affiliate: '$_id.affiliate',
        campaign: '$_id.campaign',
      },
    },
  ]);

  const earned = await Chain.aggregate([
    {
      $match: {
        dispute: null,
      },
    },
    {
      $group: {
        _id: { affiliate: '$affiliate', campaign: '$campaign' },
        total: { $sum: '$affiliateReward' },
      },
    },
    {
      $addFields: {
        affiliateId: '$_id.affiliate',
        campaignId: '$_id.campaign',
      },
    },
  ]);

  const campaigns = (await Campaign.find({}, 'rewardThreshold').lean()).reduce(
    (memo, current) => {
      // eslint-disable-next-line no-param-reassign
      memo[current._id.toString()] = current;
      return memo;
    },
    {},
  );

  let count = 0;
  for (const {
    total,
    affiliateId,
    campaignId,
    _id: { affiliate },
  } of earned) {
    const paidAmount =
      paid.find(
        x => x.campaignId === campaignId && x.affiliateId === affiliateId,
      )?.total || 0;
    if (campaigns[campaignId].rewardThreshold <= total - paidAmount) {
      // create payout if able will load some aggregations again
      // but this job should only run in cron
      // and this is the price we pay for better security
      count += +(await createPayoutIfAble(campaigns[campaignId], affiliate));
    }
  }
  return count;
}

export const createPayoutIfAble = async (campaign, affiliate, force) => {
  if (
    !(
      (affiliate?._id || affiliate) instanceof Mongoose.Types.ObjectId &&
      campaign._id instanceof Mongoose.Types.ObjectId
    )
  )
    throw new Error(
      'campaign must be a campaign object, affiliate must be an affiliate object or an affiliate objectId',
    );

  const { pending } = await getAffiliateEarningsByCampaign(affiliate);
  const campaignId = campaign._id.toString();
  const match = pending.find(x => x.campaign._id.toString() === campaignId);
  if (
    !affiliate ||
    !match ||
    !campaign ||
    (force ? 1 : campaign.rewardThreshold) > match.amount
  ) {
    return false;
  }
  await new Payout({
    affiliate,
    merchant: match.merchant,
    status: PAYOUT_STATUSES.REQUESTED,
    campaign: campaign._id,
    amount: match.amount,
    requestedAt: Date.now(),
  }).save();
  return true;
};
