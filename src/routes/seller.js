import express from "express";
import { addNewSeller, getAllSellers } from "../controllers/seller.js";
import { isLoggedIn } from "../middlewares/authentication.js";
import { restrictTo } from "../middlewares/authorization.js";

const Router = express.Router();

Router.post("/seller/register", isLoggedIn, restrictTo("admin"), addNewSeller);
Router.get("/sellers", isLoggedIn, restrictTo("admin"), getAllSellers);

export default Router;
