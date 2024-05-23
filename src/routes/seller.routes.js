import express from 'express';
import { adminGetAllSellers } from '../controllers/seller.js';
import { isLoggedIn } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router();

router.get(
  '/',
  isLoggedIn,
  restrictTo('admin'),
  adminGetAllSellers
);

export default router;
