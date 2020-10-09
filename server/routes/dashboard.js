import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import { getDashboard } from '../controller/dashboard';

const router = express.Router();

router.get('/', isAuthenticated(), getDashboard);

export default router;
