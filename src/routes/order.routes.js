import express from 'express';
import { isLoggedIn } from '../middlewares/authentication.js';
import { getOrders } from '../controllers/order.js';

const router = express.Router();

//
router.get('/', isLoggedIn, getOrders);

export default router;
