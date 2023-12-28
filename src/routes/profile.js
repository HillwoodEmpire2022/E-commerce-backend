import express from "express";
import { getProfile, updateProfile } from "../controllers/profile.js";
import { isLoggedIn } from "../middlewares/authentication.js";

const router = express.Router();

// Get profile by profile id
router.get("/profiles/:id", isLoggedIn, getProfile);
// Get Current Logged in user profile
router.get("/profiles", isLoggedIn, getProfile);
router.patch("/profiles", isLoggedIn, updateProfile);

export default router;
