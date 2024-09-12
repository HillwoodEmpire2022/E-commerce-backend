import express from 'express';
import {
  userRegister,
  userLogin,
  resetUserPassword,
  getMe,
  updatePassword,
  userUpdatePhoto,
  userUpdateProfile,
  forgotPassword,
  deleteAccount,
  requestVerificationEmail,
  deactivateAccount,
  enableTwoFactorAuth,
  verifyEmail,
  verifyOtp,
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
 *               - confirmPassword
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User Login
 *     tags: [Authentication]
 *     description: Logs in a user with the provided credentials.
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
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 required: true
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (e.g., missing fields, invalid credentials)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
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
router.post('/request-account-verification-email', requestVerificationEmail);

/**
 * @swagger
 * /auth/deactivate-account/{id}:
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
router.patch('/deactivate-account/:id', isLoggedIn, restrictTo('admin'), deactivateAccount);

/**
 * @swagger
 * /auth/activate-account/{activationToken}:
 *   get:
 *     summary: Activate an account
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: activationToken
 *         required: true
 *         description: The activation token received via email
 *         schema:
 *           type: string
 *     description: This endpoint allows users to activate their account using the activation token received via email.
 *     responses:
 *       '200':
 *         description: Activation successful
 *       '400':
 *         description: Bad Request - Invalid activation token
 *       '500':
 *         description: Internal Server Error - An error occurred while activating the account
 */
router.get('/activate-account/:activationToken', verifyEmail);

/**
 * @swagger
 * /auth/get-me:
 *   get:
 *     summary: Get current user's information
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     description: This endpoint returns the information of the currently logged-in user.
 *     responses:
 *       '200':
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized - User is not logged in
 *       '500':
 *         description: Internal Server Error - An error occurred while retrieving user information
 */
router.get('/get-me', isLoggedIn, getMe);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     tags:
 *       - Authentication
 *     description: Sends a password reset email to the provided email address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address to send the password reset email to.
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Success message indicating the password reset email has been sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "Password reset email sent to user@example.com."
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
 *                   example: "An error occurred while sending the password reset email."
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{resetUserToken}:
 *   patch:
 *     summary: Reset Password
 *     tags:
 *       - Authentication
 *     description: Resets the user's password using the provided reset token.
 *     parameters:
 *       - in: path
 *         name: resetUserToken
 *         required: true
 *         description: The reset token received via email
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The new password.
 *                 required: true
 *               confirmPassword:
 *                 type: string
 *                 description: The confirmation of the new password.
 *                 required: true
 *             required:
 *               - password
 *               - confirmPassword
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (e.g., missing fields, invalid reset token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
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
 *                   example: "An error occurred while resetting the password."
 */
router.patch('/reset-password/:resetUserToken', resetUserPassword);

/**
 * @swagger
 * /auth/update-password:
 *   patch:
 *     summary: Update Password
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     description: Updates the user's password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The user's current password.
 *                 required: true
 *               newPassword:
 *                 type: string
 *                 description: The user's new password.
 *                 required: true
 *               confirmPassword:
 *                 type: string
 *                 description: The confirmation of the new password.
 *                 required: true
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (e.g., missing fields, invalid current password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized - User is not logged in
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
 *                   example: "An error occurred while updating the password."
 */
router.patch('/update-password', isLoggedIn, updatePassword);

/**
 * @swagger
 * /auth/update-photo:
 *   patch:
 *     summary: Update Profile Photo
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     description: Updates the user's profile photo.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: The user's profile photo.
 *                 required: true
 *     responses:
 *       200:
 *         description: Profile photo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (e.g., missing photo)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized - User is not logged in
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
 *                   example: "An error occurred while updating the profile photo."
 */
router.patch('/update-photo', isLoggedIn, uploadProfilePicture, userUpdatePhoto);

/**
 * @swagger
 * /auth/profile-data:
 *   patch:
 *     summary: Update Profile Data
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     description: Updates the user's profile data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The user's first name.
 *                 required: true
 *               lastName:
 *                 type: string
 *                 description: The user's last name.
 *                 required: true
 *             required:
 *               - firstName
 *               - lastName
 *     responses:
 *       200:
 *         description: Profile data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (e.g., missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized - User is not logged in
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
 *                   example: "An error occurred while updating the profile data."
 */
router.patch('/profile-data', isLoggedIn, userUpdateProfile);

/**
 * @swagger
 * /auth/delete-account/{id}:
 *   delete:
 *     summary: Delete an account
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The id of the account to delete
 *         schema:
 *           type: string
 *     description: This endpoint allows users to delete their account.
 *     responses:
 *       '200':
 *         description: Account deleted successfully
 *       '400':
 *         description: Bad Request - Invalid request body or path parameter
 *       '401':
 *         description: Unauthorized - User is not logged in
 *       '403':
 *         description: Forbidden - User is not authorized to delete the account
 *       '500':
 *         description: Internal Server Error - An error occurred while deleting the account
 */
router.delete('/delete-account/:id', isLoggedIn, deleteAccount);

// 2FA
// enable 2fa
/**
 * @swagger
 * /auth/enable-2fa:
 *   patch:
 *     summary: Enable two factor authentication
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     description: This endpoint allows users to enable two factor authentication.
 *     responses:
 *       '200':
 *         description: Two factor authentication enabled successfully
 *       '500':
 *         description: Internal Server Error - An error occurred while deleting the account
 */
router.patch('/enable-2fa', isLoggedIn, enableTwoFactorAuth);

// Verify otp
router.post('/verify-otp', verifyOtp);

export default router;
