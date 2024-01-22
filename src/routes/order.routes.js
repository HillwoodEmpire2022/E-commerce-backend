import express from 'express';
import { isLoggedIn } from '../middlewares/authentication.js';
import { getOrders, updateOrder } from '../controllers/order.js';

const router = express.Router();

router.use(isLoggedIn);

router.get('/', getOrders);
router.patch('/:id', updateOrder);

export default router;
