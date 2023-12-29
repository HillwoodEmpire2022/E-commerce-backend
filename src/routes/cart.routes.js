import express from "express";
import {
  addToCart,
  deleteAllCartItems,
  deleteCartItem,
  getCartItems,
  updateCartItem,
} from "../controllers/productsCart.js";
import { isLoggedIn } from "../middlewares/authentication.js";

const router = express.Router();

router.post("/cartitem/create", isLoggedIn, addToCart);
router.get("/cartitems", isLoggedIn, getCartItems);
router.delete("/delete/cartitem/:cartItemId", isLoggedIn, deleteCartItem);
router.patch("/edit/cartitem/:cartItemId", isLoggedIn, updateCartItem);
router.delete("/cart/deleteall", isLoggedIn, deleteAllCartItems);

export default router;
