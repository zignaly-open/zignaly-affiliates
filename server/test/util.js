import assert from 'assert';
import { customQuery } from '../service/data-importer';
import saveDataFromPostgresToMongo from '../service/data-processor';
import { getAffiliate, getMerchant, request } from './_common';
import Campaign, { SERVICE_TYPES } from '../model/campaign';
import Upload from '../model/upload';
import { PAYMENT_TYPE_PROFIT_SHARING } from '../service/chain-processor';

// no worries about preparing queries here
export const createVisit = ({
  trackId,
  date,
  affiliateId,
  campaignId,
}) => `INSERT INTO marketing.campaign_events
          ("track_id", "insert_date", "event_date", "event_type", "payment_type", "user_id", "service_id", "affiliate_id", "campaign_id", "sub_track_id", "quantity", "amount", "allocated", "profit_sharing") VALUES
          (
            '${trackId}',
            '${date.format('YYYY-MM-DD HH:mm:ss.SSS')}',
            '${date.format('YYYY-MM-DD HH:mm:ss.SSS')}',
            'click',
            NULL,
            NULL,
            NULL,
            '${affiliateId}',
            '${campaignId}',
            '',
            NULL,
            NULL,
            NULL,
            NULL
          )
      `;

export const createIdentify = ({
  trackId,
  date,
  userId,
}) => `INSERT INTO marketing.campaign_events
          ("track_id", "insert_date", "event_date", "event_type", "payment_type", "user_id", "service_id", "affiliate_id", "campaign_id", "sub_track_id", "quantity", "amount", "allocated", "profit_sharing") VALUES
          (
            '${trackId}',
            '${date.format('YYYY-MM-DD HH:mm:ss.SSS')}',
            '${date.format('YYYY-MM-DD HH:mm:ss.SSS')}',
            'identify',
            NULL,
            '${userId}',
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL
          )
      `;

export const createConnect = ({
  serviceId,
  date,
  userId,
  allocatedMoney,
}) => `INSERT INTO marketing.campaign_events
          ("track_id", "insert_date", "event_date", "event_type", "payment_type", "user_id", "service_id", "affiliate_id", "campaign_id", "sub_track_id", "quantity", "amount", "allocated", "profit_sharing") VALUES
          (
            NULL,
            '${date.format('YYYY-MM-DD HH:mm:ss.SSS')}',
            '${date.format('YYYY-MM-DD HH:mm:ss.SSS')}',
            'connect',
            NULL,
            '${userId}',
            '${serviceId}',
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            ${allocatedMoney},
            NULL
          )
      `;

export const createPayment = ({
  serviceId,
  date,
  userId,
  paymentType = PAYMENT_TYPE_PROFIT_SHARING,
  quantity,
  amount,
}) => `INSERT INTO marketing.campaign_events
          ("track_id", "insert_date", "event_date", "event_type", "payment_type", "user_id", "service_id", "affiliate_id", "campaign_id", "sub_track_id", "quantity", "amount", "allocated", "profit_sharing") VALUES
          (
            NULL,
            '${date.format('YYYY-MM-DD HH:mm:ss.SSS')}',
            '${date.format('YYYY-MM-DD HH:mm:ss.SSS')}',
            'payment',
            '${paymentType}',
            '${userId}',
            '${serviceId}',
            NULL,
            NULL,
            NULL,
            ${quantity || 0},
            '${amount}',
            NULL,
            NULL
          )
      `;

const createServiceIdXMerchantId = ({ serviceId, merchantId }) =>
  `INSERT INTO marketing.services ("service_id", "owner_id") VALUES ('${serviceId}', '${merchantId}')`;

export const clearDatabase = async () => {
  await customQuery(`CREATE SCHEMA IF NOT EXISTS marketing;`);
  await customQuery(`DROP TABLE IF EXISTS marketing.campaign_events;`);
  await customQuery(`DROP TABLE IF EXISTS marketing.services;`);
  await customQuery(`
      CREATE TABLE IF NOT EXISTS marketing.campaign_events (
          "event_id" SERIAL PRIMARY KEY,
          "track_id" character varying(4000),
          "insert_date" timestamp,
          "event_date" timestamp,
          "event_type" character varying(50),
          "payment_type" character varying(50),
          "user_id" character varying(50),
          "service_id" character varying(400),
          "affiliate_id" character varying(400),
          "campaign_id" character varying(400),
          "sub_track_id" character varying(400),
          "quantity" bigint,
          "amount" numeric(17,2),
          "allocated" numeric(21,2),
          "profit_sharing" boolean
      ) WITH (oids = false);
  `);

  await customQuery(`
      CREATE TABLE IF NOT EXISTS marketing.services (
          "service_id" character varying(50),
          "owner_id" character varying(400)
      ) WITH (oids = false);
  `);
};

export const createQuery = async (queryParts, serviceIdUserIdList = []) => {
  for (const sql of queryParts) {
    await customQuery(sql);
  }
  for (const [serviceId, merchantId] of serviceIdUserIdList) {
    await customQuery(createServiceIdXMerchantId({ serviceId, merchantId }));
  }
};

export const createQueryAndSave = async (
  queryParts,
  serviceIdUserIdList = [],
) => {
  await clearDatabase();
  await createQuery(queryParts, serviceIdUserIdList);
  await saveDataFromPostgresToMongo();
};

export async function getDashboard(token) {
  const { body: dashboard } = await request('get', 'dashboard', token);
  return dashboard;
}

export async function createCampaign(
  token,
  { rewardValue, rewardDuration, serviceType, serviceIds },
) {
  const { body: campaignData } = await request('post', 'campaign', token).send({
    shortDescription: 'Test Campaign',
    name: `Test Campaign ${Math.random()}`,
    rewardValue,
    rewardDuration,
    description: 'Test Campaign',
    termsAndConditions: 'Test Campaign',
    publish: true,
    serviceType,
    rewardThreshold: 1000,
    media: [await new Upload({}).save()],
    zignalyServiceIds: serviceIds,
    landingPage: '1111',
  });
  return campaignData;
}
export async function createUsersAndCampaigns() {
  const merchantAlice = await getMerchant();
  const merchantMary = await getMerchant();
  const zignalyAdmin = await getMerchant();
  const affiliateBob = await getAffiliate();
  const affiliateJohn = await getAffiliate();

  merchantAlice.profitSharingCampaign = await createCampaign(
    merchantAlice.token,
    {
      rewardValue: 10,
      rewardDuration: 5,
      serviceType: SERVICE_TYPES.PROFIT_SHARING,
      serviceIds: 'aliceprofit',
    },
  );

  merchantAlice.monthlyFeeCampaign = await createCampaign(merchantAlice.token, {
    rewardValue: 1000,
    rewardDuration: 5,
    serviceType: SERVICE_TYPES.MONTHLY_FEE,
    serviceIds: 'alicemonthly',
  });

  merchantMary.monthlyFeeCampaign = await createCampaign(merchantMary.token, {
    rewardValue: 500,
    rewardDuration: 0,
    serviceType: SERVICE_TYPES.MONTHLY_FEE,
    serviceIds: 'marymonthly',
  });

  // we need to make sure deleted system campaigns are supported
  await new Campaign({
    isSystem: true,
    deletedAt: Date.now(),
    shortDescription: 'Zignaly campaign Deleted lol',
    rewardDurationMonths: 1,
    rewardThreshold: 10000,
    rewardValue: 1000,
    landingPage: '/',
    name: 'Zignaly campaign Deleted',
    serviceType: SERVICE_TYPES.MONTHLY_FEE,
    merchant: zignalyAdmin.user._id,
    investedThreshold: 10000,
  }).save();

  const zignalyCampaign = await new Campaign({
    isSystem: true,
    shortDescription: 'Zignaly campaign',
    rewardDurationMonths: 1,
    rewardThreshold: 10000,
    rewardValue: 1000,
    landingPage: '/',
    name: 'Zignaly campaign',
    serviceType: SERVICE_TYPES.MONTHLY_FEE,
    merchant: zignalyAdmin.user._id,
    investedThreshold: 10000,
  }).save();

  await request(
    'post',
    `campaign/activate/${merchantAlice.profitSharingCampaign._id}`,
    affiliateBob.token,
  );
  await request(
    'post',
    `campaign/activate/${merchantAlice.monthlyFeeCampaign._id}`,
    affiliateBob.token,
  );
  await request(
    'post',
    `campaign/activate/${merchantMary.monthlyFeeCampaign._id}`,
    affiliateBob.token,
  );
  await request(
    'post',
    `campaign/activate/${merchantAlice.profitSharingCampaign._id}`,
    affiliateJohn.token,
  );
  await request(
    'post',
    `campaign/activate/${merchantAlice.monthlyFeeCampaign._id}`,
    affiliateJohn.token,
  );
  await request(
    'post',
    `campaign/activate/${merchantMary.monthlyFeeCampaign._id}`,
    affiliateJohn.token,
  );

  return {
    merchantAlice,
    merchantMary,
    zignalyAdmin,
    affiliateBob,
    affiliateJohn,
    zignalyCampaignId: zignalyCampaign._id.toString(),
  };
}

const toComparableFormat = array => {
  const copy = [...array];
  copy.sort((a, b) => a[0].localeCompare(b[0]));
  return JSON.stringify(copy);
};

/**
 * @param dashboard from the backend
 * @param table [[campaign, visits, identifies, connects, payments, earnings]]
 */
export function dashboardLooksLikeThis(dashboard, table) {
  const dashboardTransformed = dashboard.table.reduce((memo, row) => {
    let match = memo.find(x => x[0] === row.campaign._id);
    if (!match) {
      match = [row.campaign._id, 0, 0, 0, 0, 0];
      memo.push(match);
    }
    match[1] += row.conversions.click;
    match[2] += row.conversions.signup;
    match[3] += row.conversions.connect;
    match[4] += row.conversions.payment;
    match[5] +=
      (typeof row.earnings !== 'undefined' ? row.earnings : row.revenue) / 100;
    return memo;
  }, []);

  assert.equal(
    toComparableFormat(dashboardTransformed),
    toComparableFormat(table),
  );
}
