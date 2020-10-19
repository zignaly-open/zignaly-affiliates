import Campaign from '../model/campaign';

const letters = 'abcdefghijklmnopqrstuvwxyz';
const digits = '0123456789';
const allCharacters = letters + letters.toLocaleUpperCase() + digits;
const length = 8;

export async function createReferralLink() {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += allCharacters.charAt(
      Math.floor(Math.random() * allCharacters.length),
    );
  }
  const campaignWithThisLink = await Campaign.findOne({
    'affiliates.shortLink': result,
    deletedAt: null,
  });
  if (campaignWithThisLink)
    // 8^66 options. the probability of us going even the 2nd time is extremely small
    return createReferralLink();
  return result;
}
