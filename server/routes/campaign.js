import express from 'express';

import { isRole } from '../middleware/auth';
import {
  create,
  getMyCampaign,
  getMyCampaigns,
  updateMyCampaign,
  deleteMyCampaign,
} from '../controller/campaign';

import { USER_ROLES } from '../model/user';

const router = express.Router();

router.post('/', isRole(USER_ROLES.MERCHANT), create);
router.get('/my/', isRole(USER_ROLES.MERCHANT), getMyCampaigns);
router.get('/my/:id', isRole(USER_ROLES.MERCHANT), getMyCampaign);
router.put('/my/:id', isRole(USER_ROLES.MERCHANT), updateMyCampaign);
router.delete('/my/:id', isRole(USER_ROLES.MERCHANT), deleteMyCampaign);

export default router;
