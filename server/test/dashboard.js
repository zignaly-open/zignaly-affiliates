import assert from 'assert';
import moment from 'moment';
import {
  createCampaign,
  getAffiliateToken,
  getMerchantToken,
  me,
  request,
} from './_common';
import * as databaseHandler from './mongo-mock';
import Chain from '../model/chain';
import Visit from '../model/visit';

const createChain = async ({ affiliate, merchant, campaign, profit, date }) => {
  const visit = {
    id: Math.random(),
    date: date.toJSON(),
    subtrack: '111',
  };

  await new Visit({
    affiliate,
    merchant,
    campaign,
    visit,
  }).save();

  return new Chain({
    affiliate,
    merchant,
    campaign,
    totalPaid: profit * 100,
    affiliateReward: profit * 10,
    visit,
  }).save();
};

const fillDatabase = async (affiliateToken, merchantToken) => {
  const {
    body: { _id: campaign },
  } = await createCampaign(merchantToken);
  const {
    body: { _id: affiliate },
  } = await me(affiliateToken).expect(200);
  const {
    body: { _id: merchant },
  } = await me(merchantToken).expect(200);
  await request('post', `campaign/activate/${campaign}`, affiliateToken);
  await createChain({
    affiliate,
    merchant,
    campaign,
    profit: 100,
    date: moment().subtract(3, 'day'),
  });
  await createChain({
    affiliate,
    merchant,
    campaign,
    profit: 200,
    date: moment().subtract(3, 'day'),
  });
  await createChain({
    affiliate,
    merchant,
    campaign,
    profit: 500,
    date: moment().subtract(10, 'day'),
  });
};

describe('Affiliate Dashboard', function () {
  before(databaseHandler.connect);
  afterEach(databaseHandler.clearDatabase);
  after(databaseHandler.closeDatabase);

  it('should load dashboard', async function () {
    const merchantToken = await getMerchantToken();
    const affiliateToken = await getAffiliateToken();
    await fillDatabase(affiliateToken, merchantToken);
    const { body } = await request('get', 'dashboard', affiliateToken);
    assert(body.table.length === 2);
    assert(body.table[0].earnings === 5000);
    assert(body.table[1].earnings === 3000);
    assert(body.totalEarned === 8000);
    assert(body.totalPending === 8000);
  });

  it('should load dashboard with short timeframe', async function () {
    const merchantToken = await getMerchantToken();
    const affiliateToken = await getAffiliateToken();
    await fillDatabase(affiliateToken, merchantToken);
    const { body } = await request(
      'get',
      `dashboard?startDate=${moment().subtract(5, 'day').toJSON()}`,
      affiliateToken,
    );
    assert(body.table[0].earnings === 3000);
    assert(body.table.length === 1);
    assert(body.totalEarned === 8000);
    assert(body.totalPending === 8000);
  });
});

describe('Merchant Dashboard', function () {
  before(databaseHandler.connect);
  afterEach(databaseHandler.clearDatabase);
  after(databaseHandler.closeDatabase);

  it('should load dashboard', async function () {
    const merchantToken = await getMerchantToken();
    const affiliateToken = await getAffiliateToken();
    await fillDatabase(affiliateToken, merchantToken);
    const { body } = await request('get', 'dashboard', merchantToken);
    assert(body.table.length === 2);
    assert(body.table[0].revenue === 50000);
    assert(body.table[1].revenue === 30000);
    assert(body.totalRevenue === 80000);
    assert(body.totalPending === 8000);
  });

  it('should load dashboard with short timeframe', async function () {
    const merchantToken = await getMerchantToken();
    const affiliateToken = await getAffiliateToken();
    await fillDatabase(affiliateToken, merchantToken);
    const { body } = await request(
      'get',
      `dashboard?startDate=${moment().subtract(5, 'day').toJSON()}`,
      merchantToken,
    );
    assert(body.table[0].revenue === 30000);
    assert(body.table.length === 1);
    assert(body.totalRevenue === 80000);
    assert(body.totalPending === 8000);
  });
});
