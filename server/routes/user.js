import express from 'express';

import passport from 'passport';
import { isAuthenticated } from '../middleware/auth';
import {
  authenticate,
  create,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  updateCurrentUser,
  getMerchantProfile,
  validatePasswordResetToken,
  sendEmail,
} from '../controller/user';
import withRecaptcha from '../middleware/captcha';

const router = express.Router();

router.get('/me', isAuthenticated(), getCurrentUser);
router.put('/me', isAuthenticated(), updateCurrentUser);
router.get('/merchant/:id', isAuthenticated(), getMerchantProfile);
router.post('/', withRecaptcha, create);
router.post('/email/:id', isAuthenticated(), withRecaptcha, sendEmail);
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
