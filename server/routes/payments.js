import express from 'express';
import {
  disputeChain,
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
router.post('/chain/dispute/:id', disputeChain);

export default router;
