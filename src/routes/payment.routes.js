import express from 'express';
import dotenv from 'dotenv';

import { isLoggedIn } from '../middlewares/authentication.js';
import {
  cashout,
  checkout,
  flw_webhook,
  rw_mobile_money,
  webhook,
} from '../controllers/payment.js';
import { restrictTo } from '../middlewares/authorization.js';

dotenv.config();

const router = express.Router();

router.post('/flw-webhook', flw_webhook);

router.post('/', isLoggedIn, checkout);
router.post('/checkout/momo', isLoggedIn, rw_mobile_money);
router.post(
  '/cashout',
  isLoggedIn,
  restrictTo('admin'),
  cashout
);
router.post('/webhook', webhook);

export default router;
