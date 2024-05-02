import express from 'express';
import {
  userRegister,
  userLogin,
  activateAccount,
  resetUserPassword,
  getMe,
  updatePassword,
  userUpdatePhoto,
  userUpdateProfile,
  forgotPassword,
  deleteAccount,
  requestVerificationEmail,
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
 * /auth/register:
 *   post:
 *     summary: Registers a new user
 *     tags: [Authentication]
 *     description: Creates a new user account with the provided information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *                 required: true
 *               firstName:
 *                 type: string
 *                 description: The user's first name.
 *                 required: true
 *               lastName:
 *                 type: string
 *                 description: The user's last name.
 *                 required: true
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 required: true
 *               role:
 *                 type: string
 *                 description: The user's role (e.g., 'admin', 'user').
 *                 required: true
 *               confirmPassword:
 *                 type: string
 *                 description: The confirmation of the user's password.
 *                 required: true
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - password
 *               - confirmPassword  // Adjust based on requirements
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (e.g., missing fields, invalid email)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.post('/register', userRegister);

router.post('/login', userLogin);

/**
 * @swagger
 * /auth/request-account-verification-email:
 *   post:
 *     summary: Request Account Verification Email
 *     description: Sends an account verification email to the provided email address.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address to send the verification email to.
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Success message indicating the verification email has been sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "Verification email sent to user@example.com."
 *       400:
 *         description: Bad request. Could be due to invalid email format or missing email in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Invalid email format or email is missing."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Internal server error message.
 *                   example: "An error occurred while sending the verification email."
 */
router.post(
  '/request-account-verification-email',
  requestVerificationEmail
);

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
