import Campaign from '../model/campaign';
import { MAIN_PROJECT_URL } from '../config';
import { logError } from '../service/logger';

export const redirect = async (req, res) => {
  const { key } = req.params;
  const campaign = await Campaign.findOne(
    {
      'affiliates.shortLink': key,
      deletedAt: null,
    },
    '+affiliates',
  )
    .populate('affiliates.user')
    .populate('merchant');
  if (!campaign) {
    logError(`Invalid redirect key: ${key}`);
    res.redirect(MAIN_PROJECT_URL);
  } else {
    const affiliate = campaign.affiliates.find(x => x.shortLink === key);
    const { landingPage } = campaign;
    const { user } = affiliate;
    const url = `${MAIN_PROJECT_URL}${landingPage}${
      landingPage.includes('?') ? '&' : '?'
    }campaign_id=${campaign._id}&affiliate=${user._id}&merchant_zignaly_id=${
      campaign.merchant.zignalyId
    }&merchant_id=${campaign.merchant._id}`;
    res.redirect(url);
  }
};
