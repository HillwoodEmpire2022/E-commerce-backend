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
    const user = req.user
  
    const displayedUserInfo = {
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
    }
    res.status(200).json({ user: displayedUserInfo });
    

  } catch (err) {
    res.status(500).send(err.message);
  }

});

router.get("/auth/google/failure", isLoggedIn, (req, res) => {
  console.log(req.user);
  console.log("failed");
  res.status(401).json({
    message: "Unable to sign in using Google, please try again later",
  });
});

export default router;
