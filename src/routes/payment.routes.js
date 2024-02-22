import express from 'express';
import { isLoggedIn } from '../middlewares/authentication.js';
import { checkout, verifyTransaction } from '../controllers/payment.js';

const router = express.Router();

router.post('/', isLoggedIn, checkout);
router.post('/verify-payment', isLoggedIn, verifyTransaction);

export default router;
