import express from 'express';
import { getUser, getUsers, searchUser, updateUserRole } from '../controllers/user.js';
import { isLoggedIn } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';
import orderRoutes from '../routes/order.routes.js';

const router = express.Router();
// Orders of a specific seller

router.use(isLoggedIn, restrictTo('admin'));
router.get('/', getUsers);
router.get('/search', searchUser);
router.patch('/:id', updateUserRole);
router.get('/:id', getUser);
router.use('/:sellerId/orders', orderRoutes);

export default router;
