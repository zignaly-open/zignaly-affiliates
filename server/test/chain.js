import assert from 'assert';
import {
  createCampaign,
  getAffiliateToken,
  getMerchantToken,
  me,
  request,
} from './_common';
import * as databaseHandler from './mongo-mock';
import {
  calculateAffiliateReward,
  getChainData,
} from '../service/chain-processor';
import { SERVICE_TYPES } from '../model/campaign';

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

  it('should create chain data by the proper input', async function () {
    const merchantToken = await getMerchantToken();
    const affiliateToken = await getAffiliateToken();
    const { body: campaignData } = await createCampaign(merchantToken, {
      publish: false,
      rewardDurationMonths: 1,
    });
    const { _id: id, zignalyServiceIds, rewardValue } = campaignData;
    const {
      body: { _id: affiliateId },
    } = await me(affiliateToken).expect(200);
    await request('post', `campaign/activate/${id}`, affiliateToken);
    const chainData = await getChainData({
      visit: {
        campaign_id: id,
        affiliate_id: affiliateId,
        event_id: 1,
        event_date: Date.now(),
        subtrack: '11111',
      },
      payments: payments.map(x => ({ ...x, service_id: zignalyServiceIds[0] })),
    });

    assert(
      chainData.totalPaid ===
        100 * payments.reduce((sum, x) => sum + +x.amount, 0),
    );
    assert(calculateAffiliateReward(campaignData, payments) === rewardValue);
    assert(chainData.affiliateReward === rewardValue, 0);
  });
});
