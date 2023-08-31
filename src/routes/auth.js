import express from "express";
import {
  userRegister,
  userLogin,
  googleAuthenticationSuccess,
} from "../controllers/auth.js";
import passport from "passport";
import generateJWToken from "../utils/jwToken.js";
import isLoggedIn from "../middlewares/loggedInCheck.js";

const router = express.Router();

router.post("/user/register", userRegister);
router.post("/user/login", userLogin);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/failure",
  })
);
// console.log(req.user);

router.get("/auth/google/success", isLoggedIn, (req, res) => {
  try {

    console.log(res.user, "yes");
    console.log(user, "yes")
    console.log(req.user, "yes")
    res.status(200).send(user);

  } catch (err) {
    res.status(500).send(err.message);
  }

  // res.status(200).json({ user: req.user})
});

router.get("/auth/google/failure", isLoggedIn, (req, res) => {
  console.log(req.user);
  console.log("failed");
  res.status(401).json({
    message: "Unable to sign in using Google, please try again later",
  });
});

export default router;
