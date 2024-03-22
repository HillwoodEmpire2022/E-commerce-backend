import crypto from 'crypto';
import express from 'express';
import { isLoggedIn } from '../middlewares/authentication.js';
import { checkout } from '../controllers/payment.js';

const router = express.Router();

router.post('/', isLoggedIn, checkout);

export default router;
