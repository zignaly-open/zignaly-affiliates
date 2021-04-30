import assert from 'assert';
import {
  getAffiliateToken,
  request,
  getMerchantToken,
  createCampaign,
  getCampaignData,
  getMerchantAndAffiliateAndStuff,
  getMerchant,
  me,
} from './_common';
import * as databaseHandler from './mongo-mock';
import Campaign, { SERVICE_TYPES } from '../model/campaign';

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
      'shortDescription',
      'zignalyServiceIds',
      'landingPage',
      'serviceType',
      'rewardValue',
    ])
      assert(errors[k]);
  });

  it('should not let specify some fields', async function () {
    const accessToken = await getMerchantToken();

    await request('post', 'campaign', accessToken)
      .send({ ...(await getCampaignData()), isDefault: true })
      .expect(400);

    await request('post', 'campaign', accessToken)
      .send({ ...(await getCampaignData()), isSystem: true })
      .expect(400);
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
    assert(noCampaigns.filter(x => x.isDefault !== true).length === 0);

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
    assert(oneCampaign.filter(x => x.isDefault !== true).length === 1);
    assert(oneCampaign.filter(x => x.isDefault !== true)[0]._id === _id);

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
    assert(oneUpdatedCampaign.filter(x => x.isDefault !== true).length === 1);
    assert(
      oneUpdatedCampaign.filter(x => x.isDefault !== true)[0].name === newName,
    );

    await request('del', `campaign/my/${_id}`, accessToken).expect(200);

    const { body: noCampaignsAfterDeletion } = await request(
      'get',
      'campaign/my',
      accessToken,
    ).expect(200);
    assert(
      noCampaignsAfterDeletion.filter(x => x.isDefault !== true).length === 0,
    );
  });

  it('should not let changign some fields during edit', async function () {
    const accessToken = await getMerchantToken();
    const {
      body: { _id },
    } = await request('post', 'campaign', accessToken)
      .send(await getCampaignData())
      .expect(201);

    const { body: updatedCampaign } = await request(
      'put',
      `campaign/my/${_id}`,
      accessToken,
    )
      .send({
        ...(await getCampaignData()),
        isSystem: true,
        isDefault: true,
      })
      .expect(200);

    assert(!updatedCampaign.isSystem);
    assert(!updatedCampaign.isDefault);
  });

  it('should not have 2 same codes', async function () {
    const accessToken = await getMerchantToken();
    let campaign = await getCampaignData();
    campaign = {
      ...campaign,
      discountCodes: [campaign.discountCodes[0], campaign.discountCodes[0]],
    };
    await request('post', 'campaign', accessToken).send(campaign).expect(400);
  });

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
  });

  it('should give you a short link after activation', async function () {
    const {
      campaignData: { _id: id },
      affiliateToken,
    } = await getMerchantAndAffiliateAndStuff();
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

  it('should generate and delete codes', async function () {
    const merchantToken = await getMerchantToken();
    const affiliateToken = await getAffiliateToken();
    const campaignData = await getCampaignData();
    const {
      body: { _id: id },
    } = await createCampaign(merchantToken, campaignData);

    await request('post', `campaign/activate/${id}`, affiliateToken);

    const {
      body: {
        affiliate: { discountCodes: initialDiscountCodes },
      },
    } = await request(
      'get',
      `campaign/marketplace/${id}`,
      affiliateToken,
    ).expect(200);

    assert(initialDiscountCodes.length === 0);

    await request('post', `campaign/marketplace/${id}/code`, affiliateToken)
      .send({ code: '1234', subtrack: '11' })
      .expect(200);
    await request('post', `campaign/marketplace/${id}/code`, affiliateToken)
      .send({ code: '12345', subtrack: '11' })
      .expect(400);
    await request('post', `campaign/marketplace/${id}/code`, affiliateToken)
      .send({ code: '1234', subtrack: '11' })
      .expect(400);
    await request('post', `campaign/marketplace/${id}/code`, affiliateToken)
      .send({ code: '1234', subtrack: '12' })
      .expect(200);

    const {
      body: {
        affiliate: { discountCodes: codesAfterTwoWereCreated },
      },
    } = await request(
      'get',
      `campaign/marketplace/${id}`,
      affiliateToken,
    ).expect(200);

    assert(codesAfterTwoWereCreated.length === 2);

    await request('delete', `campaign/marketplace/${id}/code`, affiliateToken)
      .send({ code: '1234', subtrack: '12' })
      .expect(200);

    const {
      body: {
        affiliate: { discountCodes: codesAfterOneWasDeleted },
      },
    } = await request(
      'get',
      `campaign/marketplace/${id}`,
      affiliateToken,
    ).expect(200);

    assert(codesAfterOneWasDeleted.length === 1);

    await request('get', `code/${id}/123412`).expect(404);
    const { body: apiResponse } = await request(
      'get',
      `code/${id}/123411`,
    ).expect(200);

    assert(apiResponse.code === '1234');
  });

  it('should not save duplicate codes or change stuff after an affiliate is added', async function () {
    const merchantToken = await getMerchantToken();
    const affiliateToken = await getAffiliateToken();
    const campaignData = await getCampaignData();
    const {
      body: { _id: id },
    } = await createCampaign(merchantToken, campaignData);

    await request('post', `campaign/activate/${id}`, affiliateToken);
    await request(
      'post',
      `campaign/marketplace/${id}/code`,
      affiliateToken,
    ).send({ code: '1234', subtrack: '11' });

    const {
      body: { discountCodes: duplicateDiscountCodesNotSaved },
    } = await request('put', `campaign/my/${id}`, merchantToken)
      .send({
        ...campaignData,
        discountCodes: [
          campaignData.discountCodes[0],
          campaignData.discountCodes[0],
        ],
      })
      .expect(200);

    assert(duplicateDiscountCodesNotSaved.length === 1);

    const { body: notUpdatedCampaign } = await request(
      'put',
      `campaign/my/${id}`,
      merchantToken,
    )
      .send({
        ...campaignData,
        discountCodes: [
          {
            ...campaignData.discountCodes[0],
            value: 77,
          },
        ],
        serviceType: SERVICE_TYPES.PROFIT_SHARING,
        rewardValue: campaignData.rewardValue + 1,
        rewardThreshold: campaignData.rewardThreshold + 1,
      })
      .expect(200);
    assert(notUpdatedCampaign.serviceType === campaignData.serviceType);
    assert(notUpdatedCampaign.rewardValue === campaignData.rewardValue);
    assert(notUpdatedCampaign.rewardThreshold === campaignData.rewardThreshold);
    assert(
      notUpdatedCampaign.discountCodes[0].value ===
        campaignData.discountCodes[0].value,
    );
  });

  it('should create default campaigns', async function () {
    const accessToken = await getMerchantToken();
    assert((await me(accessToken)).body.hasDefaultCampaign);
    await Campaign.remove({});
    assert(!(await me(accessToken)).body.hasDefaultCampaign);
    const { body: newDefaultCampaign } = await request(
      'post',
      'campaign/default',
      accessToken,
    )
      .send({ rewardThreshold: 100, rewardValue: 200, rewardDuration: 0 })
      .expect(201);
    assert((await me(accessToken)).body.hasDefaultCampaign);
    const campaign = await Campaign.findOne({});
    assert(campaign.isDefault);
    assert(campaign.name === 'Default campaign');
    assert(campaign.rewardValue === 200);

    const { body: updatedDefaultCampaign } = await request(
      'post',
      'campaign/default',
      accessToken,
    )
      .send({ rewardThreshold: 100, rewardValue: 300, rewardDuration: 0 })
      .expect(200);

    assert(updatedDefaultCampaign._id === newDefaultCampaign._id);
    assert(updatedDefaultCampaign.rewardValue === 300);
  });

  it('should not let activate default campaign', async function () {
    const { defaultCampaignId } = await getMerchant();
    const affiliateToken = await getAffiliateToken();

    await request(
      'post',
      `campaign/activate/${defaultCampaignId}`,
      affiliateToken,
    ).expect(403);

    const defaultCampaignExists = await Campaign.findOne({
      _id: defaultCampaignId,
    });
    assert(defaultCampaignExists);
    assert(defaultCampaignExists.affiliates.length === 0);
  });

  it('should not let delete default campaign', async function () {
    const { token, defaultCampaignId } = await getMerchant();
    await request('del', `campaign/my/${defaultCampaignId}`, token).expect(403);
  });

  it('should not let edit default campaign', async function () {
    const { token, defaultCampaignId } = await getMerchant();
    await request('put', `campaign/my/${defaultCampaignId}`, token)
      .send({
        name: '12345',
      })
      .expect(403);
  });
});
