import express from 'express';
import { isLoggedIn } from '../middlewares/authentication.js';
import { getOrder, getOrders, updateOrder } from '../controllers/order.js';

const router = express.Router();

router.use(isLoggedIn);

router.get('/', getOrders);
router.patch('/:id', updateOrder).get(getOrder);
router.get('/:id', getOrder);

export default router;
