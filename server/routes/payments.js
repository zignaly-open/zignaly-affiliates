import express from 'express';
import { getPayments, requestPayout, payPayout } from '../controller/payments';

const router = express.Router();

router.get('/', getPayments);
router.post('/request/:campaign', requestPayout);
router.post('/request/pay/:id', requestPayout);
router.post('/payout/:id', payPayout);

export default router;
