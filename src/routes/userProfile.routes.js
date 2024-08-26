import express from 'express';
import { getProfile, getProfiles, updateProfile } from '../controllers/userProfile.js';
import { isLoggedIn } from '../middlewares/authentication.js';

const router = express.Router({ mergeParams: true });

router.get('/', isLoggedIn, getProfiles);
router.patch('/', isLoggedIn, updateProfile);
router.get('/:profileId', isLoggedIn, getProfile);

export default router;
