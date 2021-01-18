import Payout, { PAYOUT_STATUSES } from '../model/payout';
import Chain from '../model/chain';
import Campaign from '../model/campaign';
import {getAffiliateEarningsByCampaign} from "./statistics";

export async function createPendingPayouts() {
  const paid = (await Payout.aggregate([
    {
      $match: {
        paidAt: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: {affiliate: '$affiliate', campaign: '$campaign'},
        total: { $sum: '$amount' },
      },
    },
  ]));

  const earned = (await Chain.aggregate([
    {
      $group: {
        _id: {affiliate: '$affiliate', campaign: '$campaign'},
        total: { $sum: '$affiliateReward' },
      },
    },
  ]));


  const campaigns = (await Campaign.find({ deletedAt: null }, 'rewardThreshold').lean()).reduce((memo, cur) => {
    memo[cur._id.toString()] = cur.rewardThreshold;
    return memo;
  }, {});

  for(let {total, _id: { affiliate, campaign }} of earned) {
    const paidAmount = paid.find(x => x.campaign.toString() === campaign.toString() && x.affiliate.toString() === affiliate.toString()) || 0;
    if(campaigns[campaign.toString()] >= total - paidAmount){
      await createPayoutIfAble(campaign, affiliate);
    }
  }
}

export const createPayoutIfAble = async (campaign, affiliate) => {
  const { pending } = await getAffiliateEarningsByCampaign(affiliate);
  const match = pending.find(
    x => x.campaign._id.toString() === campaign._id.toString(),
  );
  if (
    !affiliate ||
    !match ||
    !campaign ||
    campaign.rewardThreshold > match.amount
  ) {
    return { success: false };
  }
  await new Payout({
    affiliate,
    merchant: match.merchant,
    status: PAYOUT_STATUSES.REQUESTED,
    campaign: campaign._id,
    amount: match.amount,
    requestedAt: Date.now(),
  }).save();
  return { success: !!campaign };
};
