import express from 'express';

import passport from 'passport';
import { isAuthenticated, isRole } from '../middleware/auth';
import {
  authenticate,
  create,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  updateCurrentUser,
  getMerchantProfile,
  validatePasswordResetToken,
} from '../controller/user';
import withRecaptcha from '../middleware/captcha';
import { USER_ROLES } from '../model/user';

const router = express.Router();

router.get('/me', isAuthenticated(), getCurrentUser);
router.put('/me', isAuthenticated(), updateCurrentUser);
router.get(
  '/merchant/:id',
  isAuthenticated(),
  isRole(USER_ROLES.AFFILIATE),
  getMerchantProfile,
);
router.post('/', withRecaptcha, create);
router.post('/request-reset', withRecaptcha, requestPasswordReset);
router.get('/can-reset', validatePasswordResetToken);
router.post('/reset', resetPassword);
router.post(
  '/auth',
  withRecaptcha,
  passport.authenticate('local', { session: false, failWithError: true }),
  authenticate,
  function (error, req, res, next) {
    // Handle error
    return res.status(401).json({ success: false });
  },
);

export default router;
