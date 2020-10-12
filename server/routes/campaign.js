import express from 'express';
import paginate from 'express-paginate';

import { isRole } from '../middleware/auth';
import {
  create,
  searchCampaigns,
  getActiveCampaigns,
  activateCampaign,
  getMyCampaign,
  getOneCampaign,
  getMyCampaigns,
  updateMyCampaign,
  deleteMyCampaign,
  getUserCampaigns,
} from '../controller/campaign';

import { USER_ROLES } from '../model/user';

const router = express.Router();

router.post('/', isRole(USER_ROLES.MERCHANT), create);
router.get('/merchant/:id', isRole(USER_ROLES.AFFILIATE), getUserCampaigns);
router.get('/marketplace/:id', isRole(USER_ROLES.AFFILIATE), getOneCampaign);
router.get(
  '/marketplace/',
  isRole(USER_ROLES.AFFILIATE),
  paginate.middleware(50, 200),
  searchCampaigns,
);
router.post('/activate/:id', isRole(USER_ROLES.AFFILIATE), activateCampaign);
router.get(
  '/active',
  isRole(USER_ROLES.AFFILIATE),
  paginate.middleware(50, 200),
  getActiveCampaigns,
);
router.get('/my/', isRole(USER_ROLES.MERCHANT), getMyCampaigns);
router.get('/my/:id', isRole(USER_ROLES.MERCHANT), getMyCampaign);
router.put('/my/:id', isRole(USER_ROLES.MERCHANT), updateMyCampaign);
router.delete('/my/:id', isRole(USER_ROLES.MERCHANT), deleteMyCampaign);

export default router;
