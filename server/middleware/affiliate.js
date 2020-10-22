import Campaign from '../model/campaign';

const withAffiliate = async (req, res, next) => {
  const campaign = await Campaign.findOne(
    {
      _id: req.params.id,
      deletedAt: null,
    },
    '+affiliates',
  );
  const affiliate = campaign.affiliates.find(
    ({ user }) => user.toString() === req.user._id.toString(),
  );
  if (!affiliate) {
    res.status(400).json({ error: 'Not an affiliate' });
  } else {
    req.campaign = campaign;
    req.affiliate = affiliate;
    next();
  }
};

export default withAffiliate;
