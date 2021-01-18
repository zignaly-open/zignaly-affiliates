import User, { USER_ROLES } from '../model/user';
import Payout, { PAYOUT_STATUSES } from '../model/payout';
import Chain from '../model/chain';

import Campaign from '../model/campaign';
import {
  getAffiliateEarningsByCampaign,
  getAffiliateTotals,
  getMerchantNotRequestedExpensesByCampaign,
} from '../service/statistics';
import { createPayoutIfAble } from '../service/payouts';
import Dispute from '../model/dispute';

const getAffiliatePayments = async (filter, user) => {
  const { pending, payouts } = await getAffiliateEarningsByCampaign(user);

  const allChains = await Chain.find(
    {
      affiliate: user,
    },
    '-totalPaid',
  )
    .populate('dispute')
    .populate('campaign', 'name')
    .populate('merchant', 'name')
    .lean();

  return {
    payouts: [...payouts, ...pending],
    conversions: allChains,
    ...(await getAffiliateTotals(user)),
  };
};

const getMerchantPayments = async (filter, user) => {
  const allPayments = await Payout.find({
    merchant: user,
  })
    .populate('campaign', 'name')
    .populate('affiliate', 'name paymentCredentials')
    .lean();

  const allChains = await Chain.find({
    merchant: user,
  })
    .populate('dispute')
    .populate('campaign', 'name')
    .populate('affiliate', 'name paymentCredentials')
    .lean();

  const notRequested = (
    (await getMerchantNotRequestedExpensesByCampaign(user)) || []
  ).map(x => ({
    ...x,
    status: PAYOUT_STATUSES.ENOUGH_BUT_NO_PAYOUT,
    id: `${x.affiliate._id}-${x.campaign._id}`,
  }));
  return {
    payouts: [...notRequested, ...allPayments],
    conversions: allChains,
  };
};

export const getPayments = async (req, res) => {
  const {
    query: filter,
    user: { data: user },
  } = req;
  let payments;
  if (user.role === USER_ROLES.AFFILIATE) {
    payments = await getAffiliatePayments(filter, user);
  } else if (user.role === USER_ROLES.MERCHANT) {
    payments = await getMerchantPayments(filter, user);
  }
  res.status(200).json(payments);
};

export const requestPayoutFromMerchantSide = async (req, res) => {
  const {
    params: { campaign: campaignId, affiliate: affiliateId },
    user: { _id: merchant },
  } = req;
  const affiliate = await User.findOne({
    _id: affiliateId,
  });
  const campaign = await Campaign.findOne({
    'affiliates.user': affiliateId,
    merchant,
    _id: campaignId,
  });
  res.json({ success: await createPayoutIfAble(campaign, affiliate) });
};

export const payPayout = async (req, res) => {
  const payout = await Payout.findOne({
    merchant: req.user._id,
    status: { $ne: PAYOUT_STATUSES.PAID },
    _id: req.params.id,
  });
  payout.transactionId = req.body.transactionId;
  payout.note = req.body.note;
  payout.method = req.body.method;
  payout.status = PAYOUT_STATUSES.PAID;
  payout.paidAt = Date.now();
  await payout.save();
  res.json({ success: true });
};

export const disputeChain = async (req, res) => {
  const chain = await Chain.findOne({
    merchant: req.user._id,
    _id: req.params.id,
  });
  if (chain) {
    const { merchant, affiliate, campaign, externalUserId } = chain;
    const dispute = new Dispute({
      merchant,
      affiliate,
      campaign,
      externalUserId,
      text: req.body.text || '',
      date: Date.now(),
    });
    await dispute.save();
    chain.dispute = dispute;
    await chain.save();
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
};
