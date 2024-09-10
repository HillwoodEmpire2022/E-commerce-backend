import express from 'express';
import { getProfile, updateProfile } from '../controllers/userProfile.js';
import { isLoggedIn } from '../middlewares/authentication.js';

const router = express.Router({ mergeParams: true });

router.patch('/', isLoggedIn, updateProfile);
router.get('/', isLoggedIn, getProfile);

export default router;
