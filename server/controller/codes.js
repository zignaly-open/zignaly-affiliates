import Campaign from '../model/campaign';

export const getCode = async (req, res) => {
  const { campaign: id, code } = req.params;
  const campaign = await Campaign.findOne(
    {
      _id: id,
      deletedAt: null,
    },
    '+affiliates',
  ).lean();

  const foundCode = campaign.affiliates?.map(({discountCodes}) => discountCodes.find(x => x.code + x.subtrack === code)).filter(x => x)[0];
  const foundDiscount = foundCode && campaign.discountCodes?.find(x => x.code === foundCode.code);

  if (foundCode && foundDiscount) {
    res.json({...foundDiscount, ...foundCode})
  } else {
    res.send(404).json({success: false})
  }
};
