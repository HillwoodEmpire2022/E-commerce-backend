import express from 'express';
import {
  userRegister,
  userLogin,
  returnedUserInfo,
  activateAccount,
  resetUserPassword,
  getMe,
  updatePassword,
  userUpdatePhoto,
  userUpdateProfile,
  forgotPassword,
  deleteAccount,
} from '../controllers/auth.js';
import { isLoggedIn } from '../middlewares/authentication.js';
import { uploadProfilePicture } from '../utils/multer.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Authentication
 *  description: Authentication APIs
 */

/**
 * @swagger
 * /user/register:
 *    post:
 *      summary: Sign up API
 *      tags: [Authentication]
 *      requestBody:
 *       description: JSON user data for registering a new user.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  firstname:
 *                     type: string
 *                  lastname:
 *                     type: string
 *                  email:
 *                     type: string
 *                  password:
 *                     type: string
 *      responses:
 *        201:
 *          description: User successfully registered and a response of user object and token.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *        422:
 *          description: Failing validations error.
 *        409:
 *          description: Existing user with the provided email error.
 */
router.post('/register', userRegister);
/**
 * @swagger
 * /user/login:
 *    post:
 *      summary: Log In API.
 *      tags: [Authentication]
 *      requestBody:
 *       description: JSON user data for logging in a user.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  email:
 *                     type: string
 *                  password:
 *                     type: string
 *      responses:
 *        200:
 *          description: User successfully logged in and a response of user object and token.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *        422:
 *          description: Failing validations error.
 *        401:
 *          description: Wrong email or password error.
 */
router.post('/login', userLogin);
router.get(
  '/activate-account/:activationToken',
  activateAccount
);
router.get('/get-me', isLoggedIn, getMe);
router.post('/forgot-password', forgotPassword);
router.patch(
  '/reset-password/:resetUserToken',
  resetUserPassword
);
router.patch(
  '/update-password',
  isLoggedIn,
  updatePassword
);
router.patch(
  '/update-photo',
  isLoggedIn,
  uploadProfilePicture,
  userUpdatePhoto
);
router.patch(
  '/profile-data',
  isLoggedIn,
  userUpdateProfile
);

router.delete(
  '/delete-account/:id',
  isLoggedIn,
  deleteAccount
);

export default router;
