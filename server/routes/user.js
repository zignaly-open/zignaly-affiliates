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

const router = express.Router();

router.get('/me', isAuthenticated(), getCurrentUser);
router.put('/me', isAuthenticated(), updateCurrentUser);
router.post('/', create);
router.post('/request-reset', requestPasswordReset);
router.get('/can-reset', validatePasswordResetToken);
router.post('/reset', resetPassword);
router.post(
  '/auth',
  passport.authenticate('local', { session: false }),
  authenticate,
);

export default router;
