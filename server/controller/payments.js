import { USER_ROLES } from '../model/user';
import Payout, { PAYOUT_STATUSES } from '../model/payout';
import Campaign from '../model/campaign';

// mocked
const getAffiliatePayments = async (filter, user) => {
  const allPayments = await Payout.find({
    affiliate: user,
  })
    .populate('campaign', 'name')
    .populate('merchant', 'name')
    .lean();
  const campaigns = await Campaign.find({
    'affiliates.user': user,
  })
    .populate('merchant')
    .lean();
  const pendingAmounts = campaigns.map(c => {
    const amount = c.rewardThreshold * (0.5 + Math.random());
    return {
      amount,
      campaign: {
        name: c.name,
        _id: c._id,
        rewardThreshold: c.rewardThreshold,
      },
      merchant: {
        name: c.merchant.name,
        _id: c.merchant._id,
      },
      status:
        amount >= c.rewardThreshold
          ? PAYOUT_STATUSES.CAN_CHECKOUT
          : PAYOUT_STATUSES.NOT_ENOUGH,
    };
  });

  return {
    payouts: [...allPayments, ...pendingAmounts],
    conversions: campaigns.map(campaign => ({
      date: Date.now(),
      campaign,
      merchant: campaign.merchant,
      amount: Math.random() * 100,
      status: ['COMPLETE', 'PENDING', 'REJECTED'][
        Math.floor(3 * Math.random())
      ],
    })),
    totalPaid: 1570.05,
    totalPending: 10.05,
  };
};

// mocked
const getMerchantPayments = async (filter, user) => {
  const campaigns = await Campaign.find({
    merchant: user,
  }).lean();

  const allPayments = await Payout.find({
    merchant: user,
  })
    .populate('campaign', 'name')
    .populate('affiliate', 'name paymentCredentials')
    .lean();

  return {
    payouts: allPayments,
    conversions: campaigns.map(campaign => ({
      date: Date.now(),
      campaign,
      amount: Math.random() * 100,
      status: ['COMPLETE', 'PENDING', 'REJECTED'][
        Math.floor(3 * Math.random())
      ],
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
  // TODO: tests and validation
  const campaign = await Campaign.findOne({
    'affiliates.user': req.user._id,
    _id: req.params.campaign,
  });
  if (campaign) {
    await new Payout({
      affiliate: req.user._id,
      merchant: campaign.merchant,
      status: PAYOUT_STATUSES.REQUESTED,
      campaign: req.params.campaign,
      amount: 100,
      requestedAt: Date.now(),
    }).save();
  }
  res.json({ success: !!campaign });
};

export const payPayout = async (req, res) => {
  // TODO: tests and validation
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
