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
  validatePasswordResetToken,
} from '../controller/user';
import withRecaptcha from "../middleware/captcha";

const router = express.Router();

router.get('/me', isAuthenticated(), getCurrentUser);
router.put('/me', isAuthenticated(), updateCurrentUser);
router.post('/', withRecaptcha, create);
router.post('/request-reset', withRecaptcha, requestPasswordReset);
router.get('/can-reset', validatePasswordResetToken);
router.post('/reset', resetPassword);
router.post(
  '/auth',
  withRecaptcha,
  passport.authenticate('local', { session: false, failWithError: true }),
  authenticate,
  // eslint-disable-next-line no-unused-vars
  function (error, req, res, next) {
    // Handle error
    return res.status(401).json({ success: false });
  },
);

export default router;
