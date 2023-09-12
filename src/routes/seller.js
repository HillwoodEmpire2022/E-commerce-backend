import express from "express"
import { addNewSeller, getAllSellers } from "../controllers/seller.js"
import {  isAdmin } from "../middlewares/auth.js"

const Router = express.Router()

Router.post("/seller/register", isAdmin, addNewSeller)
Router.get("/sellers", isAdmin, getAllSellers)

export default Router
