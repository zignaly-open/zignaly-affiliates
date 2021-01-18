import express from 'express';
import {
  getPayments,
  payPayout,
  requestPayoutFromMerchantSide,
} from '../controller/payments';

const router = express.Router();

router.get('/', getPayments);
router.post(
  '/merchant-payout/:campaign/:affiliate',
  requestPayoutFromMerchantSide,
);
router.post('/payout/:id', payPayout);

export default router;
