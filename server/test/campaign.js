import assert from 'assert';
import { getAffiliateToken, request, getMerchantToken } from './_common';
import * as databaseHandler from './mongo-mock';
import { DISCOUNT_TYPES, REWARD_TYPES, SERVICE_TYPES } from '../model/campaign';
import Upload from '../model/upload';

describe('Campaign', function () {
  before(databaseHandler.connect);
  afterEach(databaseHandler.clearDatabase);
  after(databaseHandler.closeDatabase);

  it('should only let merchants create campaigns', async function () {
    const accessToken = await getAffiliateToken();
    await request('post', 'campaign', accessToken).send().expect(403);
  });

  it('should give errors when needed', async function () {
    const accessToken = await getMerchantToken();
    const {
      body: { errors },
    } = await request('post', 'campaign', accessToken).send({}).expect(400);

    for (const k of [
      'name',
      'description',
      'shortDescription',
      'zignalyServiceId',
      'landingPage',
      'serviceType',
      'rewardValue',
      'media',
      'rewardType',
    ])
      assert(errors[k]);
  });

  it('should give errors when needed 2', async function () {
    const accessToken = await getMerchantToken();
    const {
      body: { errors },
    } = await request('post', 'campaign', accessToken)
      .send({
        shortDescription: new Array(100).join('qqqq'),
        serviceType: '1111',
        rewardValue: -5,
        rewardType: -5,
        media: [],
        discountCodes: [
          {
            code: '11',
            type: 1,
            value: -5,
          },
        ],
      })
      .expect(400);

    for (const k of [
      'shortDescription',
      'serviceType',
      'rewardValue',
      'media',
      'rewardType',
      'discountCodes.0.code',
      'discountCodes.0.type',
      'discountCodes.0.value',
    ])
      assert(errors[k]);
  });

  it('should save a campaign when it is valid', async function () {
    this.timeout(15000);
    const accessToken = await getMerchantToken();

    const { body: noCampaigns } = await request(
      'get',
      'campaign/my',
      accessToken,
    ).expect(200);
    assert(Array.isArray(noCampaigns));
    assert(noCampaigns.length === 0);

    const fakeUpload = await new Upload({}).save();

    const campaignData = {
      shortDescription: 'Abra Cadabra',
      name: 'Abra Cadabra',
      description: 'Abra Cadabra',
      publish: true,
      serviceType: SERVICE_TYPES.MONTHLY_FEE,
      rewardValue: 500,
      rewardType: REWARD_TYPES.FIXED_AMOUNT,
      media: [fakeUpload],
      zignalyServiceId: '1111',
      landingPage: '1111',
      discountCodes: [
        {
          code: '1234',
          type: DISCOUNT_TYPES.PERCENT,
          value: 5,
        },
      ],
    };

    const {
      body: { _id },
    } = await request('post', 'campaign', accessToken)
      .send(campaignData)
      .expect(201);

    assert(_id);

    const { body: oneCampaign } = await request(
      'get',
      'campaign/my',
      accessToken,
    ).expect(200);
    assert(Array.isArray(oneCampaign));
    assert(oneCampaign.length === 1);
    assert(oneCampaign[0]._id === _id);

    const { body: single } = await request(
      'get',
      `campaign/my/${_id}`,
      accessToken,
    ).expect(200);
    assert(single && single._id === _id);

    const newName = 'NEW CAMPAIGN';
    const { body: updatedCampaign } = await request(
      'put',
      `campaign/my/${_id}`,
      accessToken,
    )
      .send({
        ...campaignData,
        name: newName,
      })
      .expect(200);
    assert(updatedCampaign.name === newName);

    const { body: oneUpdatedCampaign } = await request(
      'get',
      'campaign/my',
      accessToken,
    ).expect(200);
    assert(oneUpdatedCampaign.length === 1);
    assert(oneUpdatedCampaign[0].name === newName);

    await request('del', `campaign/my/${_id}`, accessToken).expect(200);

    const { body: noCampaignsAfterDeletion } = await request(
      'get',
      'campaign/my',
      accessToken,
    ).expect(200);
    assert(noCampaignsAfterDeletion.length === 0);
  });
});
