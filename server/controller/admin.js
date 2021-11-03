import User, { USER_ROLES } from '../model/user';
import { objectIdToTimestamp, timestampToObjectId } from '../service/mongoid';

export const users = async (req, res) => {
  const getUsersByRole = async role =>
    (
      await User.find(
        {
          deactivatedAt: { $eq: null },
          _id: { $gte: timestampToObjectId(req.query.from || 0) },
          role,
        },
        { name: 1, email: 1, zignalyId: 1, group: 1 },
      ).lean()
    ).map(x => ({ ...x, date: objectIdToTimestamp(x._id) }));

  res.json({
    merchants: await getUsersByRole(USER_ROLES.MERCHANT),
    affiliates: await getUsersByRole(USER_ROLES.AFFILIATE),
  });
};
