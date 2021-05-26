import moment from 'moment';
import Payout, { PAYOUT_STATUSES } from '../model/payout';
import User, { USER_ROLES } from '../model/user';
import Chain from '../model/chain';
import Visit from '../model/visit';
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

export async function getConversionTable(user, startDate) {
  const isMerchant = user.role === USER_ROLES.MERCHANT;
  // prettier-ignore
  const allCampaigns = await Campaign.find(
    isMerchant
      ? {merchant: user._id}
      : {
        $or: [
          {'affiliates.user': user._id},
          {isDefault: true},
          {isSystem: true},
        ],
      },
    'name merchant isDefault isSystem',
  )
    .populate('merchant', 'name')
    .lean();

  const conversions = await Chain.aggregate([
    {
      $match: {
        dispute: null,
        ...(isMerchant ? { merchant: user._id } : { affiliate: user._id }),
        'visit.date': { $gte: moment(startDate).toDate() },
      },
    },
    {
      $group: {
        _id: {
          day: {
            $dateToString: { format: '%Y-%m-%d', date: '$visit.date' },
          },
          ...(isMerchant
            ? { affiliate: '$affiliate' }
            : { subtrack: '$visit.subtrack' }),
          campaign: '$campaign',
        },
        earnings: { $sum: '$affiliateReward' },
        revenue: { $sum: '$totalPaid' },
        connect: { $sum: 1 },
        visitId: { $max: '$visit.id' },
        payment: {
          $sum: {
            $cond: {
              if: { $gt: ['$totalPaid', 0] },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
  ]);

  const visits = await Visit.aggregate([
    {
      $match: {
        ...(isMerchant ? { merchant: user._id } : { affiliate: user._id }),
        'visit.date': { $gte: moment(startDate).toDate() },
      },
    },
    {
      $group: {
        _id: {
          day: {
            $dateToString: { format: '%Y-%m-%d', date: '$visit.date' },
          },
          ...(isMerchant
            ? { affiliate: '$affiliate' }
            : { subtrack: '$visit.subtrack' }),
          campaign: '$campaign',
        },
        visitId: { $max: '$visit.id' },
        visit: { $sum: 1 },
        signup: {
          $sum: {
            $cond: {
              if: { $ne: ['$externalUserId', null] },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
  ]);

  let affiliates = [];
  if (isMerchant)
    affiliates = await User.find(
      {
        _id: {
          $in: [
            ...[...visits, ...conversions].reduce(
              (memo, { _id: { affiliate } }) => memo.add(`${affiliate}`),
              new Set(),
            ),
          ],
        },
      },
      'name',
    ).lean();

  let remainingConversions = [...conversions];
  const processedVisits = visits.reduce(
    (
      memo,
      { _id: { day, campaign, subtrack, affiliate }, visit, visitId, signup },
    ) => {
      const check = x =>
        x.visitId === visitId &&
        // we need the campaign check because a visit that brought this guy brought it to the default/zignaly campaign
        x._id.campaign.toString() === campaign.toString();
      const matchedConversions = conversions.filter(check);
      remainingConversions = remainingConversions.filter(x => !check(x));

      matchedConversions.forEach(
        ({ earnings = 0, revenue = 0, connect = 0, payment = 0 }) => {
          memo.push({
            day,
            campaign: allCampaigns.find(x => `${x._id}` === `${campaign}`),
            // prettier-ignore
            ...(isMerchant
              ? {
                revenue,
                affiliate: affiliates.find(x => `${x._id}` === `${affiliate}`),
              }
              : {earnings}),
            subtrack: subtrack || '',
            conversions: {
              connect,
              payment,
              click: visit,
              signup,
            },
          });
        },
      );

      if (matchedConversions.length === 0) {
        memo.push({
          day,
          campaign: allCampaigns.find(x => `${x._id}` === `${campaign}`),
          // prettier-ignore
          ...(isMerchant
            ? {
              revenue: 0,
              affiliate: affiliates.find(x => `${x._id}` === `${affiliate}`),
            }
            : {earnings: 0}),
          subtrack: subtrack || '',
          conversions: {
            connect: 0,
            payment: 0,
            click: visit,
            signup,
          },
        });
      }
      return memo;
    },
    [],
  );

  return processedVisits.concat(
    remainingConversions.map(
      ({
        _id: { day, campaign, affiliate },
        earnings = 0,
        revenue = 0,
        connect = 0,
        payment = 0,
      }) => ({
        day,
        campaign: allCampaigns.find(x => `${x._id}` === `${campaign}`),

        // prettier-ignore
        ...(isMerchant
          ? {
            revenue,
            affiliate: affiliates.find(x => `${x._id}` === `${affiliate}`),
          }
          : {earnings}),
        subtrack: '',
        conversions: {
          connect,
          payment,
          click: 0,
          signup: 0,
        },
      }),
    ),
  );
}

export async function getAffiliateEarningsByCampaign(user) {
  const allPayments = await Payout.find({
    affiliate: user,
  })
    .populate('campaign', 'name')
    .populate('merchant', 'name')
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
    {
      $addFields: {
        campaignId: { $toString: '$_id' },
      },
    },
  ]);

  const campaigns = await Campaign.find({
    $or: [
      { 'affiliates.user': user },
      { _id: { $in: earningsByCampaign.map(x => x._id) } },
    ],
  })
    .populate('merchant')
    .lean();

  const pendingAmounts = earningsByCampaign
    .map(earning => ({
      ...earning,
      pending:
        earning.total -
        allPayments
          .filter(p => p.campaign._id.toString() === earning.campaignId)
          .reduce((sum, { amount }) => sum + amount, 0),
    }))
    .filter(x => x.pending > 0)
    .map(({ campaignId, pending: amount }) => {
      const c = campaigns.find(x => x._id.toString() === campaignId);
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
    {
      $addFields: {
        affiliateId: { $toString: '$_id.affiliate' },
        campaignId: { $toString: '$_id.campaign' },
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
    {
      $addFields: {
        affiliateId: { $toString: '$_id.affiliate' },
        campaignId: { $toString: '$_id.campaign' },
      },
    },
  ]);

  return chainsByAffiliateAndCampaign
    .map(({ affiliateId, campaignId, total }) => {
      const payedOut =
        payoutsByAffiliateAndCampaign.find(
          p => p.campaignId === campaignId && p.affiliateId === affiliateId,
        )?.total || 0;
      const foundCampaign = campaigns.find(
        c => c._id.toString() === campaignId,
      );
      const foundAffiliate = foundCampaign?.affiliates.find(
        a => a.user._id.toString() === affiliateId,
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
