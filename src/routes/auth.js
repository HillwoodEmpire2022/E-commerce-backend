import express from "express";
import {
  userRegister,
  userLogin,
  googleAuthenticationSuccess,
} from "../controllers/auth.js";
import passport from "passport";

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
 *      summary: Returns the object of some registered user information with an authorization token.
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
router.post("/user/register", userRegister);

/**
 * @swagger
 * /user/login:
 *    post:
 *      summary: Returns the object of some of the logged in user information with an authorization token.
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
router.post("/user/login", userLogin);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/google/failure",
    session: false,
  }),  googleAuthenticationSuccess);

router.get("/auth/google/failure", (req, res) => {
  res.status(401).json({
    message: "Unable to sign in using Google, please try again later",
  });
});

export default router;
