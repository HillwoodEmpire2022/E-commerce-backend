import express from "express";
import {
  userRegister,
  userLogin,
  returnedUserInfo,
  activateAccount,
  sendEmailToResetPassword,
  resetUserPassword,
  getMe,
  updatePassword
} from "../controllers/auth.js";
import passport from "passport";
import { isLoggedIn } from "../middlewares/authentication.js";

const router = express.Router();
const clientUrl = process.env.CLIENT_URL;
const webUrl =
  process.env.CLIENT_LOCALHOST_URL || `http://localhost:${process.env.PORT}`;

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
router.post("/register", userRegister);
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
router.post("/login", userLogin);
router.get("/activate-account/:activationToken", activateAccount);
router.get("/get-me", isLoggedIn, getMe);
router.post("/reset-password", sendEmailToResetPassword);
router.patch("/reset-password/:resetUserToken", resetUserPassword);
router.patch("/update-password" ,isLoggedIn, updatePassword);

router.get("/google/success", (req, res) => {
  try {
    const response = returnedUserInfo(req.user);
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Routes for Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

router.get(
  `/google/callback`,
  passport.authenticate("google", {
    successRedirect: clientUrl,
    failureRedirect: "/auth/google/failure",
    failureMessage: "Cannot login to google, please try again later",
  }),
  (req, res) => {
    res.send("Signed in successfully!");
  }
);

router.get("/google/failure", (req, res) => {
  res.status(401).json({
    message: "Unable to sign in using Google, please try again later",
  });
});

export default router;
