import express from 'express';
import { getUsers } from '../controllers/user.js';
import { isLoggedIn } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router();

router.get('/', isLoggedIn, restrictTo('admin'), getUsers);

export default router;
