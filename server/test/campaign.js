import assert from 'assert';
import { getAffiliateToken, request, getMerchantToken } from './_common';
import * as databaseHandler from './mongo-mock';
import { DISCOUNT_TYPES, SERVICE_TYPES } from '../model/campaign';
import Upload from '../model/upload';

const getCampaignData = async () => ({
  shortDescription: 'Abra Cadabra',
  name: 'Abra Cadabra',
  description: 'Abra Cadabra',
  termsAndConditions: 'Cadabra Abra',
  publish: true,
  serviceType: SERVICE_TYPES.MONTHLY_FEE,
  rewardValue: 500,
  rewardThreshold: 1000,
  media: [await new Upload({}).save()],
  zignalyServiceId: '1111',
  landingPage: '1111',
  discountCodes: [
    {
      code: '1234',
      type: DISCOUNT_TYPES.PERCENT,
      value: 5,
    },
  ],
});

const createCampaign = async (merchantToken, extraData = {}) =>
  request('post', 'campaign', merchantToken)
    .send({ ...(await getCampaignData()), ...extraData })
    .expect(201);

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
      'discountCodes.0.code',
      'discountCodes.0.type',
      'discountCodes.0.value',
    ])
      assert(errors[k]);
  });

  it('should save a campaign when it is valid', async function () {
    const accessToken = await getMerchantToken();

    const { body: noCampaigns } = await request(
      'get',
      'campaign/my',
      accessToken,
    ).expect(200);
    assert(Array.isArray(noCampaigns));
    assert(noCampaigns.length === 0);

    const {
      body: { _id },
    } = await request('post', 'campaign', accessToken)
      .send(await getCampaignData())
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
        ...(await getCampaignData()),
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

  // it('should not have 2 campaigns with same names', async function () {
  //   const accessToken = await getMerchantToken();
  //   const initialCampaign = await getCampaignData();
  //   await request('post', 'campaign', accessToken)
  //     .send(initialCampaign)
  //     .expect(201);
  //   const {
  //     body: { errors },
  //   } = await request('post', 'campaign', accessToken)
  //     .send(initialCampaign)
  //     .expect(400);
  //   assert(errors.name);
  //   const { body: campaignSaved } = await request(
  //     'post',
  //     'campaign',
  //     accessToken,
  //   )
  //     .send({ ...initialCampaign, name: '2222' })
  //     .expect(201);
  //   const {
  //     body: { errors: errorsFromEdit },
  //   } = await request('put', `campaign/my/${campaignSaved._id}`, accessToken)
  //     .send({ ...campaignSaved, name: initialCampaign.name })
  //     .expect(400);
  //   assert(errorsFromEdit.name);
  // });

  it('should find published campaigns', async function () {
    const merchantToken = await getMerchantToken();
    const affiliateToken = await getAffiliateToken();
    await createCampaign(merchantToken, { publish: true });
    const { body: campaigns } = await request(
      'get',
      'campaign/marketplace',
      affiliateToken,
    ).expect(200);
    assert(campaigns.pages === 1);
    assert(campaigns.campaigns.length === 1);
  });

  it('should not find not published campaigns', async function () {
    const merchantToken = await getMerchantToken();
    const affiliateToken = await getAffiliateToken();
    await createCampaign(merchantToken, { publish: false });
    const { body: campaigns } = await request(
      'get',
      'campaign/marketplace',
      affiliateToken,
    ).expect(200);
    assert(campaigns.pages === 0);
    assert(campaigns.campaigns.length === 0);
  });

  it('should search for active campaigns', async function () {
    const merchantToken = await getMerchantToken();
    const affiliateToken = await getAffiliateToken();
    const {
      body: { _id: id },
    } = await createCampaign(merchantToken, { publish: false });
    const { body: campaigns } = await request(
      'get',
      'campaign/active',
      affiliateToken,
    ).expect(200);
    assert(campaigns.campaigns.length === 0);
    const {
      body: { success },
    } = await request('post', `campaign/activate/${id}`, affiliateToken).expect(
      200,
    );
    assert(success);
    await request('post', `campaign/activate/${id}`, affiliateToken).expect(
      400,
    );
    const { body: campaignsNowNotEmpty } = await request(
      'get',
      'campaign/active',
      affiliateToken,
    ).expect(200);
    assert(campaignsNowNotEmpty.campaigns.length === 1);
  });

  it('should let you get a single campaign', async function () {
    const merchantToken = await getMerchantToken();
    const affiliateToken = await getAffiliateToken();
    const {
      body: { _id: id },
    } = await createCampaign(merchantToken);
    const { body: campaign } = await request(
      'get',
      `campaign/marketplace/${id}`,
      affiliateToken,
    ).expect(200);
    assert(!campaign.affiliates);
    assert(!campaign.affiliate);
    assert(!campaign.discountCodes);
  });

  it('should gibe you a short link after activation', async function () {
    const merchantToken = await getMerchantToken();
    const affiliateToken = await getAffiliateToken();
    const {
      body: { _id: id },
    } = await createCampaign(merchantToken);
    await request('post', `campaign/activate/${id}`, affiliateToken);

    const { body: campaign } = await request(
      'get',
      `campaign/marketplace/${id}`,
      affiliateToken,
    ).expect(200);
    assert(campaign.affiliate.shortLink);

    const {
      body: { shortLink },
    } = await request(
      'post',
      `campaign/marketplace/${id}/new-link`,
      affiliateToken,
    ).expect(200);
    assert(shortLink !== campaign.affiliate.shortLink);
    const {
      body: {
        affiliate: { shortLink: newShortLink },
      },
    } = await request(
      'get',
      `campaign/marketplace/${id}`,
      affiliateToken,
    ).expect(200);
    assert(shortLink === newShortLink);
  });
});
