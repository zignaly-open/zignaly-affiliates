import express from 'express';
import { getPayments, requestPayout } from '../controller/payments';

const router = express.Router();

router.get('/', getPayments);
router.post('/request/:campaign', requestPayout);

export default router;
