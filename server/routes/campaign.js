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
  createDiscountCode,
  deleteDiscountCode,
  setCampaignArchived,
  getUserCampaigns,
  generateNewLink,
  getArchivedCampaigns,
} from '../controller/campaign';

import { USER_ROLES } from '../model/user';
import withAffiliate from '../middleware/affiliate';

const router = express.Router();

router.post('/', isRole(USER_ROLES.MERCHANT), create);
router.get('/merchant/:id', isRole(USER_ROLES.AFFILIATE), getUserCampaigns);
router.get('/marketplace/:id', isRole(USER_ROLES.AFFILIATE), getOneCampaign);
router.post(
  '/marketplace/:id/new-link',
  isRole(USER_ROLES.AFFILIATE),
  withAffiliate,
  generateNewLink,
);
router.post(
  '/marketplace/:id/code',
  isRole(USER_ROLES.AFFILIATE),
  withAffiliate,
  createDiscountCode,
);
router.delete(
  '/marketplace/:id/code',
  isRole(USER_ROLES.AFFILIATE),
  withAffiliate,
  deleteDiscountCode,
);
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
router.get(
  '/archive',
  isRole(USER_ROLES.AFFILIATE),
  paginate.middleware(50, 200),
  getArchivedCampaigns,
);
router.get('/my/', isRole(USER_ROLES.MERCHANT), getMyCampaigns);
router.get('/my/:id', isRole(USER_ROLES.MERCHANT), getMyCampaign);
router.put('/my/:id', isRole(USER_ROLES.MERCHANT), updateMyCampaign);
router.post('/archive/:id', isRole(USER_ROLES.AFFILIATE), setCampaignArchived(true));
router.post('/unarchive/:id', isRole(USER_ROLES.AFFILIATE), setCampaignArchived(false));
router.delete('/my/:id', isRole(USER_ROLES.MERCHANT), deleteMyCampaign);

export default router;
