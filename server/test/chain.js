import assert from 'assert';
import {
  createPaymentsForCampaign,
  getMerchantAndAffiliateAndChainAndStuff,
  getMerchantAndAffiliateAndStuff,
  payments,
  request,
} from './_common';
import * as databaseHandler from './mongo-mock';
import { calculateAffiliateReward } from '../service/chain-processor';
import Campaign, { SERVICE_TYPES } from '../model/campaign';
import User from '../model/user';
import { getMerchantNotRequestedExpensesByCampaign } from '../service/statistics';
import { PAYOUT_STATUSES } from '../model/payout';
import { createPendingPayouts } from '../service/payouts';
import Chain from '../model/chain';

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
    const { _id: id, rewardValue } = campaignData;
    const chainData = await createPaymentsForCampaign(
      campaignData,
      affiliateId,
    );
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
    } = await getMerchantAndAffiliateAndChainAndStuff();
    const { _id: id, rewardValue } = campaignData;

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

    await createPaymentsForCampaign(campaignData, affiliateId);

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
    const { merchantToken } = await getMerchantAndAffiliateAndChainAndStuff();
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

  it('should be able to dispute chains', async function () {
    const {
      merchantToken,
      affiliateToken,
      campaignData,
    } = await getMerchantAndAffiliateAndChainAndStuff();
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

    const { body } = await request('get', 'dashboard', affiliateToken);
    assert(body.totalEarned === campaignData.rewardValue);

    const text = 'cheater btfo';
    await request(
      'post',
      `payments/chain/dispute/${merchantPayments.conversions[0]._id}`,
      merchantToken,
    ).send({ text });

    const { body: merchantPayments2 } = await request(
      'get',
      `payments`,
      merchantToken,
    );
    assert(merchantPayments2.conversions[0].dispute.text === text);
    assert(merchantPayments2.payouts.length === 0);

    const createdPayouts = await createPendingPayouts();
    assert(createdPayouts === 0);

    const { body: body2 } = await request('get', 'dashboard', affiliateToken);
    assert(body2.totalEarned === 0);
  });

  it('should persist disputes', async function () {
    const {
      merchantToken,
      campaignData,
      affiliateId,
    } = await getMerchantAndAffiliateAndChainAndStuff();
    const {
      body: {
        conversions: [{ _id: chain }],
      },
    } = await request('get', `payments`, merchantToken);
    await request('post', `payments/chain/dispute/${chain}`, merchantToken);
    const disputedChain = await Chain.findById(chain)
      .populate('dispute')
      .lean();
    assert(disputedChain.dispute.date);
    await Chain.remove({});
    await createPaymentsForCampaign(campaignData, affiliateId);
    const {
      body: {
        conversions: [{ _id: sameChain }],
      },
    } = await request('get', `payments`, merchantToken);
    const sameDisputedChain = await Chain.findById(sameChain)
      .populate('dispute')
      .lean();
    assert(
      disputedChain.dispute._id.toString() ===
        sameDisputedChain.dispute._id.toString(),
    );
  });
});
