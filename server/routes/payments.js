import express from 'express';
import {
  getPayments,
  requestPayout,
  payPayout,
  requestPayoutFromMerchantSide,
} from '../controller/payments';

const router = express.Router();

router.get('/', getPayments);
router.post('/request/:campaign', requestPayout);
router.post(
  '/merchant-payout/:campaign/:affiliate',
  requestPayoutFromMerchantSide,
);
router.post('/payout/:id', payPayout);

export default router;
