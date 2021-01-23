import express from 'express';
import {
  disputeChain,
  getPayments,
  payPayout,
  requestPayoutFromMerchantSide,
} from '../controller/payments';
import { isRole } from '../middleware/auth';
import { USER_ROLES } from '../model/user';

const router = express.Router();

router.get('/', getPayments);
router.post(
  '/merchant-payout/:campaign/:affiliate',
  isRole(USER_ROLES.MERCHANT),
  requestPayoutFromMerchantSide,
);
router.post('/payout/:id', isRole(USER_ROLES.MERCHANT), payPayout);
router.post('/chain/dispute/:id', isRole(USER_ROLES.MERCHANT), disputeChain);

export default router;
