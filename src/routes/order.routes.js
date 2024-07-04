import express from 'express';
import { isLoggedIn } from '../middlewares/authentication.js';
import { getOrder, getOrders, updateOrder } from '../controllers/order.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router({ mergeParams: true });

router.get('/', isLoggedIn, getOrders);

router.get('/:id', isLoggedIn, getOrder);
router.patch('/:id', isLoggedIn, restrictTo('admin'), updateOrder);

export default router;
