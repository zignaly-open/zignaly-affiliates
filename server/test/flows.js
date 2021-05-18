import moment from 'moment';
import { connect } from '../service/data-importer';
import * as databaseHandler from './mongo-mock';
import {
  createConnect,
  createIdentify,
  createPayment,
  createQuery,
  createUsersAndCampaigns,
  createVisit,
  getDashboard,
  dashboardLooksLikeThis,
} from './util';
import {
  PAYMENT_TYPE_COIN_PAYMENT,
  PAYMENT_TYPE_PROFIT_SHARING,
} from '../service/chain-processor';

describe('Basic flow', function () {
  before(async function () {
    await connect();
    await databaseHandler.connect();
  });
  after(async function () {
    await databaseHandler.closeDatabase();
  });

  afterEach(async function () {
    await databaseHandler.clearDatabase();
  });

  it('do nothing during the first 30 days after clicking (1.1) => no reward', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQuery([
      createVisit({
        trackId: '1',
        date: moment().subtract(31, 'days'),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
    ]);
    const result = [[merchantAlice.monthlyFeeCampaign._id, 1, 0, 0, 0, 0]];
    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), result);
    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), result);
  });

  it('sign up and do nothing during the first 30 days after clicking (1.2) => no reward', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQuery([
      createVisit({
        trackId: '1',
        date: moment().subtract(32, 'days'),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: moment().subtract(32, 'days'),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: moment().subtract(1, 'days'),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: moment().subtract(1, 'days'),
        quantity: 1,
        amount: 100,
      }),
    ]);
    const result = [[merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0]];
    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), result);
    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), result);
  });

  it('signup, connect to the service 1 = service promoted in the first 30 days after clicking (1.3) => service reward', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQuery([
      createVisit({
        trackId: '1',
        date: moment().subtract(3, 'days'),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: moment().subtract(3, 'days'),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: moment().subtract(1, 'days'),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: moment().subtract(1, 'days'),
        quantity: 2,
        amount: 1000,
      }),
    ]);

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 1000],
    ]);
    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 20],
    ]);
  });

  it('last-touch attribution', async function () {
    const {
      merchantAlice,
      affiliateJohn,
      affiliateBob,
    } = await createUsersAndCampaigns();
    await createQuery([
      createVisit({
        trackId: '1',
        date: moment().subtract(4, 'days'),
        affiliateId: affiliateJohn.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createVisit({
        trackId: '1',
        date: moment().subtract(3, 'days'),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: moment().subtract(3, 'days'),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: moment().subtract(1, 'days'),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: moment().subtract(1, 'days'),
        quantity: 2,
        amount: 1000,
      }),
    ]);

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 1000],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 0, 0, 1, 1, 20],
    ]);
    dashboardLooksLikeThis(await getDashboard(affiliateJohn.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);
  });

  it('should track regular conversions and default campaign conversions (1.4)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQuery(
      [
        createVisit({
          trackId: '1',
          date: moment().subtract(3, 'days'),
          affiliateId: affiliateBob.user._id,
          campaignId: merchantAlice.monthlyFeeCampaign._id,
        }),
        createIdentify({
          trackId: '1',
          date: moment().subtract(3, 'days'),
          userId: '1',
        }),
        createConnect({
          allocatedMoney: 10,
          serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
          date: moment().subtract(1, 'days'),
          userId: '1',
        }),
        createPayment({
          userId: '1',
          paymentType: PAYMENT_TYPE_COIN_PAYMENT,
          serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
          date: moment().subtract(1, 'days'),
          quantity: 2,
          amount: 1000,
        }),
        createConnect({
          allocatedMoney: 10,
          serviceId: 'new service you have not seen',
          date: moment().subtract(1, 'days'),
          userId: '1',
        }),
        createPayment({
          userId: '1',
          paymentType: PAYMENT_TYPE_COIN_PAYMENT,
          serviceId: 'new service you have not seen',
          date: moment().subtract(1, 'days'),
          quantity: 2,
          amount: 1000,
        }),
      ],
      [
        [merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0], 'petya'],
        ['new service you have not seen', 'petya'],
      ],
    );

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 1000],
      [merchantAlice.defaultCampaignId, 0, 0, 1, 1, 1000],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 20],
      [merchantAlice.defaultCampaignId, 0, 0, 1, 1, 2],
    ]);
  });

  it('should track regular conversions when user signs up to another campaign (1.4B)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQuery([
      createVisit({
        trackId: '1',
        date: moment().subtract(3, 'days'),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: moment().subtract(3, 'days'),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: moment().subtract(1, 'days'),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: moment().subtract(1, 'days'),
        quantity: 2,
        amount: 1000,
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: moment().subtract(1, 'days'),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_PROFIT_SHARING,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: moment().subtract(1, 'days'),
        amount: 1000,
      }),
    ]);

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 1000],
      [merchantAlice.profitSharingCampaign._id, 0, 0, 1, 1, 1000],
    ]);
    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 20],
      [merchantAlice.profitSharingCampaign._id, 0, 0, 1, 1, 100],
    ]);
  });

  it('should not pay for conversions after 30 days (1.5)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQuery([
      createVisit({
        trackId: '1',
        date: moment().subtract(50, 'days'),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: moment().subtract(50, 'days'),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: moment().subtract(49, 'days'),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: moment().subtract(49, 'days'),
        quantity: 2,
        amount: 1000,
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: moment().subtract(3, 'days'),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_PROFIT_SHARING,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: moment().subtract(3, 'days'),
        amount: 1000,
      }),
    ]);

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 1000],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 20],
    ]);
  });

  it('should not pay for conversions after 30 days', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQuery([
      createVisit({
        trackId: '1',
        date: moment().subtract(50, 'days'),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: moment().subtract(50, 'days'),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: moment().subtract(49, 'days'),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: moment().subtract(49, 'days'),
        quantity: 2,
        amount: 1000,
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: moment().subtract(3, 'days'),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_PROFIT_SHARING,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: moment().subtract(3, 'days'),
        amount: 1000,
      }),
    ]);

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 1000],
    ]);
    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 20],
    ]);
  });
});
