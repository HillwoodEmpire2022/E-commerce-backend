import express from "express";
import {
  userRegister,
  userLogin,
  googleAuthenticationSuccess,
} from "../controllers/auth.js";
import passport from "passport";

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
    session: false,
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/failure",
    session: false,
  })
);

router.get("/auth/google/success", googleAuthenticationSuccess);

router.get("/auth/google/failure", (req, res) => {
  res.status(401).json({
    message: "Unable to sign in using Google, please try again later",
  });
});

export default router;
