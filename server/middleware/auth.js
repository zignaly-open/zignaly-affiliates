import compose from 'composable-middleware';
import { validateJwt } from '../service/jwt';
import User from '../model/user';

export const sendUnauthorized = res =>
  res.status(401).json({ error: 'Unauthorized' });

export const accessDenied = res =>
  res.status(403).json({ error: 'Access denied' });

export const isAuthenticated = () =>
  compose()
    .use(validateJwt)
    .use(async function (req, res, next) {
      try {
        const user = await User.findById(req.user._id).lean();
        if (!user) return sendUnauthorized(res);
        req.user.data = user;
        next();
      } catch {
        sendUnauthorized(res);
      }
    });

export const isRole = roleRequired => (req, res, next) => {
  if (req.user.data.role === roleRequired) {
    next();
  } else {
    return accessDenied(res);
  }
};
