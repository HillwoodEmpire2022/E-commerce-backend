import express from 'express';
import { isLoggedIn } from '../middlewares/authentication.js';
import {
  cashout,
  checkout,
  rw_mobile_money,
  webhook,
} from '../controllers/payment.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router();

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
