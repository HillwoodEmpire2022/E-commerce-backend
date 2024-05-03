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
  deactivateAccount,
} from '../controllers/auth.js';
import { isLoggedIn } from '../middlewares/authentication.js';
import { uploadProfilePicture } from '../utils/multer.js';
import { restrictTo } from '../middlewares/authorization.js';
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

// Close/Deactivate Account
/**
 * @swagger
 * /deactivate-account/{id}:
 *   patch:
 *     summary: Deactivate an account
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The id of the account to deactivate
 *         schema:
 *           type: string
 *     description: This endpoint allows admins to deactivate an account. Deactivation typically involves disabling login and potentially removing some account data (depending on your service's policy).
 *     responses:
 *       '200':
 *         description: Deactivation successful
 *       '400':
 *         description: Bad Request - Invalid request body or path parameter
 *       '401':
 *         description: Unauthorized - User is not logged in or does not have admin privileges
 *       '403':
 *         description: Forbidden - User is not authorized to deactivate accounts
 *       '500':
 *         description: Internal Server Error - An error occurred while deactivating the account
 */
router.patch(
  '/deactivate-account/:id',
  isLoggedIn,
  restrictTo('admin'),
  deactivateAccount
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
