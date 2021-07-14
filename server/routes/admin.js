import express from 'express';
import { users } from '../controller/admin';

const router = express.Router();

router.get('/users', users);

export default router;
