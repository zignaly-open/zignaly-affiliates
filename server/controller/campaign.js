import Campaign, {
  FIELDS_THAT_ARE_NOT_EDITABLE_AFTER_AFFILIATE_APPEARS,
} from '../model/campaign';
import { createReferralLink } from '../service/create-referral-link';

export const create = async (req, res) => {
  const newCampaign = new Campaign(req.body);
  newCampaign.merchant = req.user._id;
  try {
    const campaign = await newCampaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const getMyCampaign = async (req, res) => {
  const campaign = await Campaign.findOne(
    {
      merchant: req.user._id,
      _id: req.params.id,
      deletedAt: null,
    },
    '+affiliates',
  ).populate('media');
  res.status(!campaign ? 404 : 200).json(campaign);
};

export const getOneCampaign = async (req, res) => {
  const campaign = await Campaign.findOne(
    {
      _id: req.params.id,
      deletedAt: null,
    },
    '+affiliates',
  )
    .populate('media')
    .populate('merchant', '-email -mailingList -role')
    .populate('merchant.media')
    .lean();
  const affiliate = campaign.affiliates?.find(
    a => a.user.toString() === req.user._id.toString(),
  );
  campaign.isArchived = !!affiliate?.isArchived;
  campaign.isAffiliate = !!affiliate;
  campaign.affiliate = affiliate;
  delete campaign.affiliates;
  res.status(!campaign ? 404 : 200).json(campaign);
};

export const updateMyCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne(
      {
        _id: req.params.id,
        merchant: req.user._id,
        deletedAt: null,
      },
      '+affiliates',
    );

    if (!campaign) {
      return res.status(404).json({ success: false });
    }
    const hasAffiliates = campaign.affiliates.length > 0;
    for (const [k, v] of Object.entries(req.body)) {
      if (k === 'discountCodes') {
        // ok so the thing here is that for codes, we keep all codes which were used by affiliates
        // and add new codes
        const codesUsedByAffiliates = (campaign.affiliates || []).reduce(
          (memo, { discountCodes }) => {
            discountCodes.forEach(({ code }) => memo.add(code));
            return memo;
          },
          new Set(),
        );
        campaign.discountCodes = [
          ...campaign.discountCodes.filter(({ code }) =>
            codesUsedByAffiliates.has(code),
          ),
          ...req.body.discountCodes.filter(
            ({ code }) => !codesUsedByAffiliates.has(code),
          ),
        ];
      } else if (
        !hasAffiliates ||
        !FIELDS_THAT_ARE_NOT_EDITABLE_AFTER_AFFILIATE_APPEARS.includes(k)
      ) {
        campaign[k] = v;
      }
    }
    await campaign.save();

    res.json(
      await Campaign.findOne({
        merchant: req.user._id,
        _id: req.params.id,
        deletedAt: null,
      })
        .populate('media')
        .lean(),
    );
  } catch (error) {
    res.status(400).json(error);
  }
};

export const deleteMyCampaign = async (req, res) => {
  const campaign = await Campaign.findOneAndUpdate(
    {
      merchant: req.user._id,
      _id: req.params.id,
    },
    {
      deletedAt: Date.now(),
    },
    { upsert: true },
  );
  // TODO: notify/cancel?
  res.status(!campaign ? 404 : 200).json({ success: true });
};

export const getMyCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({
    merchant: req.user._id,
    deletedAt: null,
  });
  res.json(campaigns);
};

const getFilteredCampaigns = async (filter, { skip, limit }) => {
  const [campaigns, itemCount] = await Promise.all([
    Campaign.find(
      filter,
      '+affiliates -termsAndConditions -zignalyServiceIds -updatedAt -createdAt -description -landingPage -media',
    )
      .populate('merchant', 'logoUrl name')
      .limit(limit)
      .skip(skip)
      .lean()
      .exec(),
    Campaign.count(filter),
  ]);

  const pages = Math.ceil(itemCount / limit);
  return {
    campaigns,
    pages,
  };
};

export const searchCampaigns = async (req, res) => {
  const { pages, campaigns } = await getFilteredCampaigns(
    {
      publish: true,
      deletedAt: null,
    },
    {
      limit: req.query.limit,
      skip: req.skip,
    },
  );

  res.json({
    campaigns: campaigns.map(campaign => {
      let affiliate = campaign.affiliates?.find(
        a => a.user.toString() === req.user._id.toString(),
      );
      return ({
        ...campaign,
        affiliates: undefined,
        discountCodes: undefined,
        isAffiliate: !!affiliate,
        isArchived: !!affiliate?.isArchived,
        discountCodesCount: campaign.discountCodes.length,
      });
    }),
    pages,
  });
};

export const setCampaignArchived = value => async (req, res) => {
  const campaign = await Campaign.findOne(
    {
      _id: req.params.id,
      "affiliates.user": req.user._id,
      deletedAt: null,
    },
    '+affiliates',
  );
  const affiliate = campaign.affiliates.find(
    ({ user }) => user.toString() === req.user._id.toString(),
  );
  affiliate.isArchived = value;
  await campaign.save();
  res.json({ success: true });
}

export const getUserCampaigns = async (req, res) => {
  const { campaigns } = await getFilteredCampaigns(
    {
      publish: true,
      merchant: req.params.id,
      deletedAt: null,
    },
    {
      limit: 1000,
      skip: 0,
    },
  );

  res.json(
    campaigns.map(campaign => {
      let affiliate = campaign.affiliates?.some(
        a => a.user.toString() === req.user._id.toString(),
      );
      return ({
        ...campaign,
        affiliates: undefined,
        discountCodes: undefined,
        isAffiliate: !!affiliate,
        isArchived: affiliate?.isArchived,
        discountCodesCount: campaign.discountCodes.length,
      });
    }),
  );
};

export const getActiveCampaigns = async (req, res) => {
  const { pages, campaigns } = await getFilteredCampaigns(
    {
      deletedAt: null,
      'affiliates.user': req.user._id,
      'affiliates.isArchived': { $ne: true },
    },
    {
      limit: req.query.limit,
      skip: req.skip,
    },
  );

  res.json({
    campaigns: campaigns.map(campaign => ({
      ...campaign,
      affiliates: undefined,
      discountCodes: undefined,
      isAffiliate: true,
      discountCodesCount: campaign.discountCodes.length,
    })),
    pages,
  });
};

export const getArchivedCampaigns = async (req, res) => {
  const { pages, campaigns } = await getFilteredCampaigns(
    {
      deletedAt: null,
      'affiliates.user': req.user._id,
      'affiliates.isArchived': true,
    },
    {
      limit: req.query.limit,
      skip: req.skip,
    },
  );

  res.json({
    campaigns: campaigns.map(campaign => ({
      ...campaign,
      affiliates: undefined,
      discountCodes: undefined,
      isAffiliate: true,
      discountCodesCount: campaign.discountCodes.length,
    })),
    pages,
  });
};

export const activateCampaign = async (req, res) => {
  const campaign = await Campaign.findOne(
    {
      _id: req.params.id,
      deletedAt: null,
    },
    '+affiliates',
  );
  if (
    campaign.affiliates.some(
      ({ user }) => user.toString() === req.user._id.toString(),
    )
  ) {
    res.status(400).json({ error: 'Already active' });
  } else {
    campaign.affiliates.push({
      user: req.user._id,
      shortLink: await createReferralLink(),
    });
    await campaign.save();
    res.json({ success: true });
  }
};

export const generateNewLink = async (req, res) => {
  const { campaign, affiliate } = req;
  const shortLink = await createReferralLink();
  affiliate.shortLink = shortLink;
  await campaign.save();
  res.json({ success: true, shortLink });
};

export const createDiscountCode = async (req, res) => {
  const {
    campaign,
    affiliate,
    body: { code, subtrack },
  } = req;

  if (
    campaign.affiliates.some(({ discountCodes }) =>
      discountCodes.some(
        discountCode =>
          discountCode.code + discountCode.subtrack === code + subtrack,
      ),
    )
  ) {
    res.status(400).json({
      success: false,
      errors: { subtrack: 'This code+subtrack is already used by somebody' },
    });
  } else if (
    !campaign.discountCodes.some(
      ({ code: campaignCode }) => campaignCode === code,
    )
  ) {
    res
      .status(400)
      .json({ success: false, errors: { code: 'Code does not exist' } });
  } else {
    affiliate.discountCodes.push({ code, subtrack });
    campaign.save();
    res.json({ success: true });
  }
};

export const deleteDiscountCode = async (req, res) => {
  const {
    campaign,
    affiliate,
    body: { code, subtrack },
  } = req;
  affiliate.discountCodes = affiliate.discountCodes.filter(
    discountCode =>
      !(discountCode.code === code && discountCode.subtrack === subtrack),
  );
  campaign.save();
  res.json({ success: true });
};
