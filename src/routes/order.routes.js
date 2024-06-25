import express from 'express';
import { isLoggedIn } from '../middlewares/authentication.js';
import { getOrder, getOrders, updateOrder } from '../controllers/order.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router({ mergeParams: true });

router.get('/', isLoggedIn, restrictTo('admin', 'customer'), getOrders);
router.patch('/:id', isLoggedIn, restrictTo('admin'), updateOrder).get(getOrder);
router.get('/:id', isLoggedIn, restrictTo('admin'), getOrder);

export default router;
