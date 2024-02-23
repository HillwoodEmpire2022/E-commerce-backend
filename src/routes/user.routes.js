import express from 'express';
import { getUsers, updateUser } from '../controllers/user.js';
import { isLoggedIn } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router();

router.get('/', isLoggedIn, restrictTo('admin'), getUsers);
router.patch('/:id', isLoggedIn, restrictTo('admin'), updateUser);

export default router;
