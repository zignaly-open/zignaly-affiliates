import Campaign from '../model/campaign';

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
  const campaign = await Campaign.findOne({
    merchant: req.user._id,
    _id: req.params.id,
    deletedAt: null,
  }).populate('media');
  res.status(!campaign ? 404 : 200).json(campaign);
};

export const getOneCampaign = async (req, res) => {
  const campaign = await Campaign.findOne({
    _id: req.params.id,
    deletedAt: null,
  })
    .populate('media')
    .lean();
  delete campaign.affiliates;
  delete campaign.discountCodes;
  res.status(!campaign ? 404 : 200).json(campaign);
};

export const updateMyCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      {
        merchant: req.user._id,
        _id: req.params.id,
        deletedAt: null,
      },
      req.body,
      { upsert: true, new: true },
    ).populate('media');
    res.status(!campaign ? 404 : 200).json(campaign);
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
      '+affiliates -termsAndConditions -zignalyServiceId -updatedAt -createdAt -description -landingPage -media',
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
    campaigns: campaigns.map(campaign => ({
      ...campaign,
      affiliates: undefined,
      discountCodes: undefined,
      isAffiliate: !!campaign.affiliates?.some(
        a => a.user.toString() === req.user._id.toString(),
      ),
      discountCodesCount: campaign.discountCodes.length,
    })),
    pages,
  });
};

export const getActiveCampaigns = async (req, res) => {
  const { pages, campaigns } = await getFilteredCampaigns(
    {
      deletedAt: null,
      'affiliates.user': req.user._id,
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
    });
    await campaign.save();
    res.json({ success: true });
  }
};
