import moment from 'moment';
import { connect } from '../service/data-importer';
import * as databaseHandler from './mongo-mock';
import User from '../model/user';
import Campaign from '../model/campaign';
import {
  createConnect,
  createIdentify,
  createPayment,
  createQueryAndSave,
  createUsersAndCampaigns,
  createVisit,
  getDashboard,
  dashboardLooksLikeThis,
  createQuery,
  clearDatabase,
} from './util';
import {
  PAYMENT_TYPE_COIN_PAYMENT,
  PAYMENT_TYPE_PROFIT_SHARING,
} from '../service/chain-processor';
import saveDataFromPostgresToMongo from '../service/data-processor';
import { request } from './_common';

const day = index => moment().subtract(60 - index, 'days');

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

  /**
   * What do we have here? Alice and Mary are merchants, Bob and John are affiliates
   *
   * Alice has 3 campaigns:
   * - Profit-sharing 10% over 5 months
   * - Monthly-fee $10 over 5 months
   * - Default ($1 over 100 months)
   *
   * Mary has 2 campaigns:
   * - Monthly-fee $5 over lifetime months
   * - Default ($1 over 100 months)
   *
   * There's also the Zignaly default campaign (applicable on $100+, $10 for 1 month)
   */
  it('do nothing during the first 30 days after clicking (1.1) => no reward', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQueryAndSave([
      createVisit({
        trackId: '1',
        date: day(0),
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
    await createQueryAndSave([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(31),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(31),
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
    await createQueryAndSave([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(1),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(2),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(2),
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
    await createQueryAndSave([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateJohn.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createVisit({
        trackId: '1',
        date: day(1),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(2),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(3),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(4),
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

  it('signup, connect to the service promoted = service 1 and then to a service from the same trader (service 2) which is not included in any campaign in the first 30 days (1.4)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQueryAndSave(
      [
        createVisit({
          trackId: '1',
          date: day(0),
          affiliateId: affiliateBob.user._id,
          campaignId: merchantAlice.monthlyFeeCampaign._id,
        }),
        createIdentify({
          trackId: '1',
          date: day(0),
          userId: '1',
        }),
        createConnect({
          allocatedMoney: 10,
          serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
          date: day(2),
          userId: '1',
        }),
        createPayment({
          userId: '1',
          paymentType: PAYMENT_TYPE_COIN_PAYMENT,
          serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
          date: day(2),
          quantity: 2,
          amount: 1000,
        }),
        createConnect({
          allocatedMoney: 10,
          serviceId: 'new service you have not seen',
          date: day(1),
          userId: '1',
        }),
        createPayment({
          userId: '1',
          paymentType: PAYMENT_TYPE_COIN_PAYMENT,
          serviceId: 'new service you have not seen',
          date: day(1),
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

  it('signup, connect to the service promoted = service 1 and then to a service from the same trader (service 2) which is included in another campaign from the same trader in the first 30 days (1.4B)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQueryAndSave([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(2),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(2),
        quantity: 2,
        amount: 1000,
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: day(2),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_PROFIT_SHARING,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: day(2),
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

  it('signup, connect to the service promoted = service 1  in the first 30 days﻿ and on day 45 then to a service from the same trader (service 2) which is not included in any other campaign  (1.5)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQueryAndSave([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(15),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(15),
        quantity: 2,
        amount: 1000,
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: day(45),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_PROFIT_SHARING,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: day(45),
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

  it('signup, connect to the service promoted = service 1 in the first 30 days﻿ and on day 45 then to a service from the same trader (service 2) which is included in other campaign (1.5B)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQueryAndSave([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        quantity: 2,
        amount: 1000,
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: day(45),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_PROFIT_SHARING,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: day(45),
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

  it('signup and connect to other service from the same trader without a campaign in the first 30 days (1.6)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQueryAndSave(
      [
        createVisit({
          trackId: '1',
          date: day(0),
          affiliateId: affiliateBob.user._id,
          campaignId: merchantAlice.monthlyFeeCampaign._id,
        }),
        createIdentify({
          trackId: '1',
          date: day(0),
          userId: '1',
        }),
        createConnect({
          allocatedMoney: 10,
          serviceId: 'abracadabra',
          date: day(20),
          userId: '1',
        }),
        createPayment({
          userId: '1',
          paymentType: PAYMENT_TYPE_COIN_PAYMENT,
          serviceId: 'abracadabra',
          date: day(20),
          quantity: 2,
          amount: 1000,
        }),
      ],
      [
        ['abracadabra', 'qqq'],
        [merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0], 'qqq'],
      ],
    );

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
      [merchantAlice.defaultCampaignId, 0, 0, 1, 1, 1000],
    ]);
    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
      [merchantAlice.defaultCampaignId, 0, 0, 1, 1, 2],
    ]);
  });

  it('signup and connect to other service from the same trader on day 45 (1.7)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQueryAndSave(
      [
        createVisit({
          trackId: '1',
          date: day(0),
          affiliateId: affiliateBob.user._id,
          campaignId: merchantAlice.monthlyFeeCampaign._id,
        }),
        createIdentify({
          trackId: '1',
          date: day(0),
          userId: '1',
        }),
        createConnect({
          allocatedMoney: 10,
          serviceId: 'abracadabra',
          date: day(45),
          userId: '1',
        }),
        createPayment({
          userId: '1',
          paymentType: PAYMENT_TYPE_COIN_PAYMENT,
          serviceId: 'abracadabra',
          date: day(45),
          quantity: 2,
          amount: 1000,
        }),
      ],
      [
        ['abracadabra', 'qqq'],
        [merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0], 'qqq'],
      ],
    );

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);
    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);
  });

  it('signup and connect to other service (service 2) from the same trader without a campaign and then to the promoted service (service 1) in the first 30 days (1.8)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQueryAndSave(
      [
        createVisit({
          trackId: '1',
          date: day(0),
          affiliateId: affiliateBob.user._id,
          campaignId: merchantAlice.monthlyFeeCampaign._id,
        }),
        createIdentify({
          trackId: '1',
          date: day(0),
          userId: '1',
        }),
        createConnect({
          allocatedMoney: 10,
          serviceId: 'abracadabra',
          date: day(5),
          userId: '1',
        }),
        createPayment({
          userId: '1',
          paymentType: PAYMENT_TYPE_COIN_PAYMENT,
          serviceId: 'abracadabra',
          date: day(5),
          quantity: 2,
          amount: 1000,
        }),
        createConnect({
          allocatedMoney: 10,
          serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
          date: day(15),
          userId: '1',
        }),
        createPayment({
          userId: '1',
          paymentType: PAYMENT_TYPE_COIN_PAYMENT,
          serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
          date: day(15),
          quantity: 2,
          amount: 2000,
        }),
      ],
      [
        ['abracadabra', 'qqq'],
        [merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0], 'qqq'],
      ],
    );

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.defaultCampaignId, 0, 0, 1, 1, 1000],
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 2000],
    ]);
    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.defaultCampaignId, 0, 0, 1, 1, 2],
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 20],
    ]);
  });

  it('signup and connect to other service without campaign  (service 2) from the same trader in the first 30 days and then on day 45 to the promoted service (service 1) (1.9)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQueryAndSave(
      [
        createVisit({
          trackId: '1',
          date: day(0),
          affiliateId: affiliateBob.user._id,
          campaignId: merchantAlice.monthlyFeeCampaign._id,
        }),
        createIdentify({
          trackId: '1',
          date: day(0),
          userId: '1',
        }),
        createConnect({
          allocatedMoney: 10,
          serviceId: 'abracadabra',
          date: day(5),
          userId: '1',
        }),
        createPayment({
          userId: '1',
          paymentType: PAYMENT_TYPE_COIN_PAYMENT,
          serviceId: 'abracadabra',
          date: day(5),
          quantity: 50,
          amount: 10000,
        }),
        createConnect({
          allocatedMoney: 10,
          serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
          date: day(45),
          userId: '1',
        }),
        createPayment({
          userId: '1',
          paymentType: PAYMENT_TYPE_COIN_PAYMENT,
          serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
          date: day(45),
          quantity: 2,
          amount: 2000,
        }),
      ],
      [
        ['abracadabra', 'qqq'],
        [merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0], 'qqq'],
      ],
    );

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.defaultCampaignId, 0, 0, 1, 1, 10000],
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);
    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.defaultCampaignId, 0, 0, 1, 1, 50],
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);
  });

  it('signup and connect to other service from a different trader who is not in the affiliate marketplace in the first 30 days and invest < $100 (1.10A)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQueryAndSave([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: 'abracadabra',
        date: day(20),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: 'abracadabra',
        date: day(20),
        quantity: 2,
        amount: 1000,
      }),
    ]);

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);
    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);
  });

  it('signup and connect to other service from a different trader who is not in the affiliate marketplace in the first 30 days and invest >$100 (1.10B)', async function () {
    const {
      merchantAlice,
      affiliateBob,
      zignalyCampaignId,
    } = await createUsersAndCampaigns();
    await createQueryAndSave([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 101,
        serviceId: 'abracadabra',
        date: day(5),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: 'abracadabra',
        date: day(5),
        quantity: 2,
        amount: 1000,
      }),
    ]);

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
      [zignalyCampaignId, 0, 0, 1, 1, 10],
    ]);
  });

  it('signup and connect to other service from a different trader who is not in the affiliate marketplace in the first 30 days and invest >$100 but the user has prior connections (1.10C)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQueryAndSave([
      createConnect({
        allocatedMoney: 10000,
        serviceId: 'abracadabraboom',
        date: day(-5),
        userId: '1',
      }),
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 101,
        serviceId: 'abracadabra',
        date: day(5),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: 'abracadabra',
        date: day(5),
        quantity: 2,
        amount: 1000,
      }),
    ]);

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);
  });

  it('signup and connect to other service from a different trader who is not in the affiliate marketplace and then to the promoted service in the first 30 days (1.11, 1.12, 1.13)', async function () {
    const {
      merchantAlice,
      affiliateBob,
      zignalyCampaignId,
    } = await createUsersAndCampaigns();
    await createQueryAndSave([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 101,
        serviceId: 'abracadabra',
        date: day(5),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: 'abracadabra',
        date: day(5),
        quantity: 2,
        amount: 1000,
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(10),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(10),
        quantity: 2,
        amount: 2000,
      }),
    ]);

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 2000],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 20],
      [zignalyCampaignId, 0, 0, 1, 1, 10],
    ]);
  });

  it('signup and connect to other service from a different trader who is in the affiliate marketplace on day 45 (1.14)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQueryAndSave([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 101,
        serviceId: 'abracadabra',
        date: day(45),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: 'abracadabra',
        date: day(45),
        quantity: 2,
        amount: 1000,
      }),
    ]);

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);
  });

  it('signup and connect to other service from a different trader who is in the affiliate marketplace in the first 30 days and then on day 45 to the promoted service (1.15)', async function () {
    const {
      merchantAlice,
      merchantMary,
      affiliateBob,
      zignalyCampaignId,
    } = await createUsersAndCampaigns();
    await createQueryAndSave([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 101,
        serviceId: merchantMary.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantMary.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        quantity: 2,
        amount: 1000,
      }),
      createConnect({
        allocatedMoney: 10,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(45),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(45),
        quantity: 2,
        amount: 2000,
      }),
    ]);

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);

    dashboardLooksLikeThis(await getDashboard(merchantMary.token), []);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
      [zignalyCampaignId, 0, 0, 1, 1, 10],
    ]);
  });

  it('signup and connect to another service from the same trader but the campaign has been deleted (1.16, 1.17)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await clearDatabase();
    await createQuery([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 101,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        quantity: 2,
        amount: 1000,
      }),
    ]);

    await request(
      'del',
      `campaign/my/${merchantAlice.monthlyFeeCampaign._id}`,
      merchantAlice.token,
    );

    await saveDataFromPostgresToMongo();

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 1000],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 2],
    ]);
  });

  it('monthly campaign deletion', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await clearDatabase();
    await createQuery([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 101,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        quantity: 2,
        amount: 1000,
      }),
    ]);

    await saveDataFromPostgresToMongo();

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 1000],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 20],
    ]);

    await createQuery([
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(6),
        quantity: 2,
        amount: 1000,
      }),
    ]);

    await request(
      'del',
      `campaign/my/${merchantAlice.monthlyFeeCampaign._id}`,
      merchantAlice.token,
    );

    await saveDataFromPostgresToMongo();

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 2000],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 22],
    ]);
  });

  it('monthly campaign fee change', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await clearDatabase();
    await createQuery([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 101,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        quantity: 2,
        amount: 1000,
      }),
    ]);

    await saveDataFromPostgresToMongo();

    await createQuery([
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(6),
        quantity: 2,
        amount: 1000,
      }),
    ]);

    await Campaign.findOneAndUpdate(
      { _id: merchantAlice.monthlyFeeCampaign._id },
      { $set: { rewardValue: 2000 } }, // amount in cents
    );

    await saveDataFromPostgresToMongo();

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 2000],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 60],
    ]);
  });

  it('profit-sharing campaign deletion', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await clearDatabase();
    await createQuery([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.profitSharingCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 101,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: day(5),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_PROFIT_SHARING,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: day(5),
        amount: 1000,
      }),
    ]);

    await saveDataFromPostgresToMongo();

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.profitSharingCampaign._id, 1, 1, 1, 1, 1000],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.profitSharingCampaign._id, 1, 1, 1, 1, 100],
    ]);

    await createQuery([
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_PROFIT_SHARING,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: day(61), // this means tomorrow
        quantity: 2,
        amount: 1000,
      }),
    ]);

    await request(
      'del',
      `campaign/my/${merchantAlice.profitSharingCampaign._id}`,
      merchantAlice.token,
    );

    await saveDataFromPostgresToMongo();

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.profitSharingCampaign._id, 1, 1, 1, 1, 2000],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.profitSharingCampaign._id, 1, 1, 1, 1, 101],
    ]);
  });

  it('profit-sharing campaign fee change', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await clearDatabase();
    await createQuery([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.profitSharingCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 101,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: day(5),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_PROFIT_SHARING,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: day(5),
        amount: 1000,
      }),
    ]);

    await saveDataFromPostgresToMongo();

    await createQuery([
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_PROFIT_SHARING,
        serviceId: merchantAlice.profitSharingCampaign.zignalyServiceIds[0],
        date: day(6),
        amount: 1000,
      }),
    ]);

    await Campaign.findOneAndUpdate(
      { _id: merchantAlice.profitSharingCampaign._id },
      { $set: { rewardValue: 20 } }, // amount in cents
    );

    await saveDataFromPostgresToMongo();

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.profitSharingCampaign._id, 1, 1, 1, 1, 2000],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.profitSharingCampaign._id, 1, 1, 1, 1, 300],
    ]);
  });

  it('profit-sharing payments monthly campaign fee calculation', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await createQueryAndSave([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 101,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_PROFIT_SHARING,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        amount: 1000,
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_PROFIT_SHARING,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(39),
        amount: 1000,
      }),
    ]);

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 2000],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 1, 20],
    ]);
  });

  it('signup and connect to the service promoted but merchant are not longer in the affiliate platform (1.18)', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await clearDatabase();
    await createQuery([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 101,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        userId: '1',
      }),
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        quantity: 2,
        amount: 1000,
      }),
    ]);

    await User.findOneAndUpdate(
      { _id: merchantAlice.user._id },
      { $set: { deactivatedAt: Date.now() } },
    );

    await saveDataFromPostgresToMongo();

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 0, 0, 0],
    ]);
  });

  it('no default campaign should be attributed if the user has connected before merchant deletion', async function () {
    const { merchantAlice, affiliateBob } = await createUsersAndCampaigns();
    await clearDatabase();
    await createQuery([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: merchantAlice.monthlyFeeCampaign._id,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
      createConnect({
        allocatedMoney: 101,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(5),
        userId: '1',
      }),
    ]);

    await saveDataFromPostgresToMongo();

    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 0, 0],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 0, 0],
    ]);

    await User.findOneAndUpdate(
      { _id: merchantAlice.user._id },
      { $set: { deactivatedAt: Date.now() } },
    );

    await createQuery([
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: merchantAlice.monthlyFeeCampaign.zignalyServiceIds[0],
        date: day(61), // it means tomorrow
        quantity: 2,
        amount: 1000,
      }),
    ]);

    await saveDataFromPostgresToMongo();

    // well, technically Alice won't see her dashboard anymore
    dashboardLooksLikeThis(await getDashboard(merchantAlice.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 0, 1000],
    ]);

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [merchantAlice.monthlyFeeCampaign._id, 1, 1, 1, 0, 0],
    ]);
  });

  it('signup to a zignaly campaign', async function () {
    const { affiliateBob, zignalyCampaignId } = await createUsersAndCampaigns();

    await clearDatabase();
    await request(
      'post',
      `campaign/activate/${zignalyCampaignId}`,
      affiliateBob.token,
    ).expect(200);

    await createQuery([
      createVisit({
        trackId: '1',
        date: day(0),
        affiliateId: affiliateBob.user._id,
        campaignId: zignalyCampaignId,
      }),
      createIdentify({
        trackId: '1',
        date: day(0),
        userId: '1',
      }),
    ]);

    await saveDataFromPostgresToMongo();

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [zignalyCampaignId, 1, 1, 0, 0, 0],
    ]);

    await createQuery([
      createConnect({
        allocatedMoney: 10,
        serviceId: '12345',
        date: day(1),
        userId: '1',
      }),
    ]);

    await saveDataFromPostgresToMongo();

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [zignalyCampaignId, 1, 1, 1, 0, 0],
    ]);

    await createQuery([
      createPayment({
        userId: '1',
        paymentType: PAYMENT_TYPE_COIN_PAYMENT,
        serviceId: '12345',
        date: day(3),
        quantity: 2,
        amount: 2000,
      }),
    ]);

    await saveDataFromPostgresToMongo();

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [zignalyCampaignId, 1, 1, 1, 0, 0],
    ]);

    await createQuery([
      'UPDATE marketing.campaign_events SET allocated=100000',
    ]);

    await saveDataFromPostgresToMongo();

    dashboardLooksLikeThis(await getDashboard(affiliateBob.token), [
      [zignalyCampaignId, 1, 1, 1, 1, 10],
    ]);
  });
});
