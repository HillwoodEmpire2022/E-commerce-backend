import express from "express";
import { addToCart } from "../controllers/productsCart.js";
import { isLoggedIn } from "../middlewares/auth.js";

const router = express.Router()

router.post("/cartitem/create", isLoggedIn, addToCart);

export default router;
