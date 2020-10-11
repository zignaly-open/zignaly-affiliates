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
  }).populate('media');
  res.json(campaigns);
};
