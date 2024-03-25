import express from 'express';
import { isLoggedIn } from '../middlewares/authentication.js';
import { checkout, webhook } from '../controllers/payment.js';

const router = express.Router();

router.post('/', isLoggedIn, checkout);

router.post('/webhook', webhook);

export default router;
