import express from "express";
import { addToCart, deleteCartItem, getCartItems, updateCartItem } from "../controllers/productsCart.js";
import { isLoggedIn } from "../middlewares/auth.js";

const router = express.Router()

router.post("/cartitem/create", isLoggedIn, addToCart);
router.get("/cartitems", isLoggedIn, getCartItems);
router.delete("/delete/cartitem/:cartItemId", isLoggedIn, deleteCartItem);
router.patch("/edit/cartitem/:cartItemId", isLoggedIn, updateCartItem)

export default router;
