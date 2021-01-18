import moment from 'moment';
import Payout, { PAYOUT_STATUSES } from '../model/payout';
import User from '../model/user';
import Chain from '../model/chain';
import Campaign from '../model/campaign';

export async function getAffiliateTotals(user) {
  const paid = await Payout.aggregate([
    {
      $match: {
        affiliate: user._id,
        paidAt: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const earned = await Chain.aggregate([
    {
      $match: {
        dispute: null,
        affiliate: user._id,
      },
    },
    {
      $group: {
        _id: '',
        total: { $sum: '$affiliateReward' },
      },
    },
  ]);

  const totalEarned = earned[0]?.total || 0;
  const totalPaid = paid[0]?.total || 0;
  return {
    totalEarned,
    totalPending: totalEarned - totalPaid,
  };
}

export async function getMerchantTotals(user) {
  const paid = await Payout.aggregate([
    {
      $match: {
        merchant: user._id,
        paidAt: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const chains = await Chain.aggregate([
    {
      $match: {
        dispute: null,
        merchant: user._id,
      },
    },
    {
      $group: {
        _id: '',
        revenue: { $sum: '$totalPaid' },
        reward: { $sum: '$affiliateReward' },
      },
    },
  ]);

  const totalRevenue = chains[0]?.revenue || 0;
  const totalReward = chains[0]?.reward || 0;
  const totalPaid = paid[0]?.total || 0;
  return {
    totalRevenue,
    totalPaid,
    totalPending: totalReward - totalPaid,
  };
}

export async function getAffiliateConversionTable(user, startDate) {
  const allCampaigns = await Campaign.find(
    {
      'affiliates.user': user._id,
    },
    'name merchant',
  )
    .populate('merchant', 'name')
    .lean();

  const table = await Chain.aggregate([
    {
      $match: {
        dispute: null,
        affiliate: user._id,
        'visit.date': { $gte: moment(startDate).toDate() },
      },
    },
    {
      $group: {
        _id: {
          day: {
            $dateToString: { format: '%Y-%m-%d', date: '$visit.date' },
          },
          subtrack: '$visit.subtrack',
          campaign: '$campaign',
        },
        earnings: { $sum: '$affiliateReward' },
        conversion: { $sum: 1 },
      },
    },
  ]);
  return table.map(
    ({ _id: { day, campaign, subtrack }, earnings, conversion }) => ({
      day,
      campaign: allCampaigns.find(x => `${x._id}` === `${campaign}`),
      earnings,
      subtrack: subtrack || '',
      conversions: {
        conversion,
      },
    }),
  );
}

export async function getAffiliateEarningsByCampaign(user) {
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

  const earningsByCampaign = await Chain.aggregate([
    {
      $match: {
        dispute: null,
        affiliate: user._id || user,
      },
    },
    {
      $group: {
        _id: '$campaign',
        total: { $sum: '$affiliateReward' },
      },
    },
  ]);

  const pendingAmounts = earningsByCampaign
    .map(earning => ({
      ...earning,
      pending:
        earning.total -
        allPayments
          .filter(p => p.campaign._id.toString() === earning._id.toString())
          .reduce((sum, { amount }) => sum + amount, 0),
    }))
    .filter(x => x.pending > 0)
    .map(({ _id: campaignId, pending: amount }) => {
      const c = campaigns.find(x => x._id.toString() === campaignId.toString());
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
    pending: pendingAmounts,
    payouts: allPayments,
  };
}

export async function getMerchantNotRequestedExpensesByCampaign(merchant) {
  const campaigns = await Campaign.find({
    merchant,
  })
    .populate('affiliates.user', 'name paymentCredentials')
    .lean();

  const payoutsByAffiliateAndCampaign = await Payout.aggregate([
    {
      $match: {
        merchant: merchant._id,
      },
    },
    {
      $group: {
        _id: { campaign: '$campaign', affiliate: '$affiliate' },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const chainsByAffiliateAndCampaign = await Chain.aggregate([
    {
      $match: {
        dispute: null,
        merchant: merchant._id,
      },
    },
    {
      $group: {
        _id: { campaign: '$campaign', affiliate: '$affiliate' },
        total: { $sum: '$affiliateReward' },
      },
    },
  ]);

  return chainsByAffiliateAndCampaign
    .map(({ _id: { campaign, affiliate }, total }) => {
      const payedOut =
        payoutsByAffiliateAndCampaign.find(
          ({ _id: p }) =>
            p.campaign.toString() === campaign.toString() &&
            p.affiliate.toString() === affiliate.toString(),
        )?.total || 0;
      const foundCampaign = campaigns.find(
        c => c._id.toString() === campaign.toString(),
      );
      const foundAffiliate = foundCampaign?.affiliates.find(
        a => a.user._id.toString() === affiliate.toString(),
      )?.user;

      return (
        foundAffiliate &&
        foundCampaign &&
        total - payedOut >= foundCampaign.rewardThreshold && {
          amount: total - payedOut,
          alreadyPaid: payedOut,
          campaign: {
            _id: foundCampaign._id,
            name: foundCampaign.name,
          },
          affiliate: foundAffiliate,
        }
      );
    })
    .filter(x => x);
}

export async function getMerchantConversionTable(user, startDate) {
  const allCampaigns = await Campaign.find(
    {
      merchant: user._id,
    },
    'name',
  ).lean();

  const table = await Chain.aggregate([
    {
      $match: {
        dispute: null,
        merchant: user._id,
        'visit.date': { $gte: moment(startDate).toDate() },
      },
    },
    {
      $group: {
        _id: {
          day: {
            $dateToString: { format: '%Y-%m-%d', date: '$visit.date' },
          },
          affiliate: '$affiliate',
          campaign: '$campaign',
        },
        revenue: { $sum: '$totalPaid' },
        conversion: { $sum: 1 },
      },
    },
  ]);

  const affiliates = await User.find({
    _id: {
      $in: [
        ...table.reduce(
          (memo, { _id: { affiliate } }) => memo.add(`${affiliate}`),
          new Set(),
        ),
      ],
    },
  }).lean();

  return table.map(
    ({ _id: { day, campaign, affiliate }, revenue, conversion }) => ({
      day,
      campaign: allCampaigns.find(x => `${x._id}` === `${campaign}`),
      affiliate: affiliates.find(x => `${x._id}` === `${affiliate}`),
      revenue,
      conversions: {
        conversion,
      },
    }),
  );
}
