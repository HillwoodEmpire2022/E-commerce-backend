import express from 'express';
import { isLoggedIn } from '../middlewares/authentication.js';
import {
  getOrder,
  getOrders,
  updateOrder,
} from '../controllers/order.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router({ mergeParams: true });

router.use(isLoggedIn, restrictTo('admin'));
router.get('/', getOrders);
router.patch('/:id', updateOrder).get(getOrder);
router.get('/:id', getOrder);

export default router;
