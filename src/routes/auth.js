import express from "express";
import {
  userRegister,
  userLogin,
  googleAuthenticationSuccess,
  returnedUserInfo,
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
router.post("/user/register", userRegister);

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
router.post("/user/login", userLogin);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get("/auth/google/success", (req, res) => { 
  res.header("Access-Control-Allow-Origin", "*");
  try { 
    const response = returnedUserInfo(req.user)
    res.status(200).json(response)   
  } catch (err) {
    res.status(500).json({ err: err.message})
  }
})

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "https://classy-salamander-0a7429.netlify.app/",
    failureRedirect: "/auth/google/failure",
    session: false,
  }));

router.get("/auth/google/failure", (req, res) => {
  res.status(401).json({
    message: "Unable to sign in using Google, please try again later",
  });
});

export default router;
