import express from 'express';
import { getCode } from '../controller/codes';

const router = express.Router();

router.get('/:campaign/:code', getCode);

export default router;
