import express from 'express';
import { redirect } from '../controller/redirect';

const router = express.Router();

router.get('/:key', redirect);

export default router;
