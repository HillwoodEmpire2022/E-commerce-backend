import express from 'express';
import { getUser, getUsers, updateUserRole } from '../controllers/user.js';
import { isLoggedIn } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router();

router.use(isLoggedIn, restrictTo('admin'));
router.get('/', getUsers);
router.patch('/:id', updateUserRole);
router.get('/:id', getUser);

export default router;
