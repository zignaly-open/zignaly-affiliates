import { USER_ROLES } from '../model/user';
import Payout, { PAYOUT_STATUSES } from '../model/payout';
import Chain from '../model/chain';
import {
  getAffiliateEarningsByCampaign,
  getAffiliateTotals,
} from '../service/statistics';

const getAffiliatePayments = async (filter, user) => {
  const { pending, payouts } = await getAffiliateEarningsByCampaign(user);

  const allChains = await Chain.find(
    {
      affiliate: user,
    },
    '-totalPaid',
  )
    .populate('campaign', 'name')
    .populate('merchant', 'name')
    .lean();

  return {
    payouts: [...payouts, ...pending],
    conversions: allChains.map(c => ({
      ...c,
      status: 'COMPLETE', // TODO
    })),
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
    .populate('campaign', 'name')
    .populate('affiliate', 'name paymentCredentials')
    .lean();

  return {
    payouts: allPayments,
    conversions: allChains.map(c => ({
      ...c,
      status: 'COMPLETE', // TODO
    })),
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

export const requestPayout = async (req, res) => {
  const {
    params: { campaign },
    user: { data: user, _id: affiliate },
  } = req;
  const { pending } = await getAffiliateEarningsByCampaign(user);
  const match = pending.find(x => x.campaign._id.toString() === campaign);
  if (match) {
    await new Payout({
      affiliate,
      merchant: match.merchant,
      status: PAYOUT_STATUSES.REQUESTED,
      campaign: req.params.campaign,
      amount: match.amount,
      requestedAt: Date.now(),
    }).save();
  }
  res.json({ success: !!campaign });
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
