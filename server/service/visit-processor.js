import Visit from '../model/visit';
import Campaign from '../model/campaign';
import User, { USER_ROLES } from '../model/user';

export async function getVisitData(visit) {
  if (visit.affiliate_id.length !== 24) return;

  const affiliate = await User.findOne({
    _id: visit.affiliate_id,
    role: USER_ROLES.AFFILIATE,
  });
  const campaign = await Campaign.findOne({
    _id: visit.campaign_id,
    'affiliates.user': visit.affiliate_id,
  });

  if (!campaign || !affiliate) return;
  const externalUserId = visit.user_id || null;

  return {
    affiliate,
    externalUserId,
    campaign,
    merchant: campaign.merchant,
    visit: {
      id: visit.event_id,
      date: visit.event_date,
      subtrack: visit.sub_track_id,
    },
  };
}

export default async function processVisit(visit) {
  const data = await getVisitData(visit);
  if (data) await new Visit(data).save();
}
