import assert from 'assert';
import { getMerchantAndAffiliateAndStuff, request } from './_common';
import * as databaseHandler from './mongo-mock';
import {
  calculateAffiliateReward,
  getChainData,
} from '../service/chain-processor';
import Campaign, { SERVICE_TYPES } from '../model/campaign';
import Chain from '../model/chain';
import User from '../model/user';
import { getMerchantNotRequestedExpensesByCampaign } from '../service/statistics';
import { PAYOUT_STATUSES } from '../model/payout';
import { createPendingPayouts } from '../service/payouts';

const payments = [
  {
    event_date: '2020-01-01T10:00:00.923Z',
    quantity: '2',
    amount: '80.00',
  },
  {
    event_date: '2020-01-15T10:00:00.923Z',
    quantity: '2',
    amount: '80.00',
  },
  {
    event_date: '2020-02-15T10:00:00.923Z',
    quantity: '1',
    amount: '50.00',
  },
  {
    event_date: '2020-03-02T10:00:00.923Z',
    quantity: '3',
    amount: '120.00',
  },
];

describe('Fee Calculation', function () {
  it('should calculate flat fee with limit 1', async function () {
    const reward = calculateAffiliateReward(
      {
        serviceType: SERVICE_TYPES.MONTHLY_FEE,
        rewardValue: 100,
        rewardDurationMonths: 1,
      },
      payments,
    );
    assert(reward === 100);
  });

  it('should calculate flat fee with limit > 1', async function () {
    const reward = calculateAffiliateReward(
      {
        serviceType: SERVICE_TYPES.MONTHLY_FEE,
        rewardValue: 100,
        rewardDurationMonths: 3,
      },
      payments,
    );
    assert(reward === 300);
  });

  it('should calculate flat fee w/o limit', async function () {
    const reward = calculateAffiliateReward(
      {
        serviceType: SERVICE_TYPES.MONTHLY_FEE,
        rewardValue: 100,
      },
      payments,
    );
    assert(reward === 800); // not in cents yet
  });

  it('should calculate profit sharing fee with limit', async function () {
    const reward = calculateAffiliateReward(
      {
        serviceType: SERVICE_TYPES.PROFIT_SHARING,
        rewardValue: 10,
        rewardDurationMonths: 2,
      },
      payments,
    );
    assert(reward === 2100); // not in cents yet
  });

  it('should calculate profit sharing fee without limit', async function () {
    const reward = calculateAffiliateReward(
      {
        serviceType: SERVICE_TYPES.PROFIT_SHARING,
        rewardValue: 10,
        rewardDurationMonths: 0,
      },
      payments,
    );
    assert(reward === 3300); // not in cents yet
  });
});

describe('Data Calculation', function () {
  before(databaseHandler.connect);
  afterEach(databaseHandler.clearDatabase);
  after(databaseHandler.closeDatabase);

  it('should create chain data by the proper input and let affiliate request payout', async function () {
    const {
      affiliateId,
      campaignData,
      affiliateToken,
      merchantToken,
    } = await getMerchantAndAffiliateAndStuff();
    const { _id: id, zignalyServiceIds, rewardValue } = campaignData;
    const chainData = await getChainData({
      visit: {
        campaign_id: id,
        affiliate_id: affiliateId,
        event_id: 1,
        event_date: Date.now(),
      },
      payments: payments.map(x => ({ ...x, service_id: zignalyServiceIds[0] })),
    });

    await new Chain(chainData).save();

    assert(
      chainData.totalPaid ===
        100 * payments.reduce((sum, x) => sum + +x.amount, 0),
    );
    assert(calculateAffiliateReward(campaignData, payments) === rewardValue);
    assert(chainData.affiliateReward === rewardValue, 0);
    const { body: affiliatePayments } = await request(
      'get',
      `payments`,
      affiliateToken,
    );
    assert(affiliatePayments.payouts.length === 1);
    assert(affiliatePayments.payouts[0].status === PAYOUT_STATUSES.NOT_ENOUGH);
    assert(
      affiliatePayments.payouts[0].amount === rewardValue &&
        affiliatePayments.totalEarned === rewardValue &&
        affiliatePayments.totalPending === rewardValue,
    );

    const { body: merchantPayments } = await request(
      'get',
      `payments`,
      merchantToken,
    );
    assert(merchantPayments.conversions.length === 1);

    await Campaign.findOneAndUpdate(
      { _id: id },
      { $set: { rewardThreshold: rewardValue } },
    );
    const { body: affiliatePayments2 } = await request(
      'get',
      `payments`,
      affiliateToken,
    );
    assert(
      affiliatePayments2.payouts[0].status === PAYOUT_STATUSES.CAN_CHECKOUT,
    );
  });

  it('should let merchants submit for payouts', async function () {
    const {
      affiliateId,
      merchantId,
      campaignData,
      affiliateToken,
      merchantToken,
    } = await getMerchantAndAffiliateAndStuff();
    const { _id: id, zignalyServiceIds, rewardValue } = campaignData;
    await new Chain(
      await getChainData({
        visit: {
          campaign_id: id,
          affiliate_id: affiliateId,
          event_id: 1,
          event_date: Date.now(),
        },
        payments: payments.map(x => ({
          ...x,
          service_id: zignalyServiceIds[0],
        })),
      }),
    ).save();
    await Campaign.findOneAndUpdate(
      { _id: id },
      { $set: { rewardThreshold: rewardValue } },
    );

    const { body: merchantPayments } = await request(
      'get',
      `payments`,
      merchantToken,
    );
    assert(merchantPayments.conversions.length === 1);
    assert(
      merchantPayments.payouts[0].status ===
        PAYOUT_STATUSES.ENOUGH_BUT_NO_PAYOUT,
    );

    await Campaign.findOneAndUpdate(
      { _id: id },
      { $set: { rewardThreshold: rewardValue } },
    );
    const {
      body: { success },
    } = await request(
      'post',
      `payments/merchant-payout/${id}/${affiliateId}`,
      merchantToken,
    );
    assert(success);

    const { body: affiliatePayments } = await request(
      'get',
      `payments`,
      affiliateToken,
    );
    assert(affiliatePayments.payouts[0].status === PAYOUT_STATUSES.REQUESTED);
    const {
      body: { payouts },
    } = await request('get', `payments`, merchantToken);
    assert(payouts[0].amount === rewardValue);
    assert(payouts[0].status === PAYOUT_STATUSES.REQUESTED);

    await new Chain(
      await getChainData({
        visit: {
          campaign_id: id,
          affiliate_id: affiliateId,
          event_id: 2,
          event_date: Date.now(),
        },
        payments: payments.map(x => ({
          ...x,
          service_id: zignalyServiceIds[0],
        })),
      }),
    ).save();

    const pendingAmount = await getMerchantNotRequestedExpensesByCampaign(
      await User.findOne({ _id: merchantId }),
    );
    assert(pendingAmount[0]?.amount === rewardValue);
    assert(pendingAmount[0]?.alreadyPaid === rewardValue);

    const {
      body: { payouts: payouts2 },
    } = await request('get', `payments`, merchantToken);
    assert(payouts2[0].amount === rewardValue);
    assert(payouts2[0].status === PAYOUT_STATUSES.ENOUGH_BUT_NO_PAYOUT);
    assert(payouts2[1].status === PAYOUT_STATUSES.REQUESTED);
  });

  it('should create payouts by cron', async function () {
    const {
      affiliateId,
      campaignData,
      merchantToken,
    } = await getMerchantAndAffiliateAndStuff();
    const { _id: id, zignalyServiceIds, rewardValue } = campaignData;
    await new Chain(
      await getChainData({
        visit: {
          campaign_id: id,
          affiliate_id: affiliateId,
          event_id: 1,
          event_date: Date.now(),
        },
        payments: payments.map(x => ({
          ...x,
          service_id: zignalyServiceIds[0],
        })),
      }),
    ).save();

    await Campaign.findOneAndUpdate(
      { _id: id },
      { $set: { rewardThreshold: rewardValue } },
    );

    const { body: merchantPayments } = await request(
      'get',
      `payments`,
      merchantToken,
    );
    assert(merchantPayments.conversions.length === 1);
    assert(
      merchantPayments.payouts[0].status ===
        PAYOUT_STATUSES.ENOUGH_BUT_NO_PAYOUT,
    );

    await createPendingPayouts();

    const { body: merchantPayments2 } = await request(
      'get',
      `payments`,
      merchantToken,
    );

    assert(merchantPayments2.payouts[0].status === PAYOUT_STATUSES.REQUESTED);
    assert(
      merchantPayments2.payouts[0].amount ===
        merchantPayments.payouts[0].amount,
    );
  });
});
