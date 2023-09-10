import express from "express"

import {  isAdmin } from "../middlewares/auth.js"
import { addCategory, addSubCategory, getCategories, getSubCategories } from "../controllers/category.js"

const Router = express.Router()

Router.post("/category/create", isAdmin, addCategory)
Router.get("/categories", getCategories)
Router.post("/subcategory/create", isAdmin, addSubCategory)
Router.get("/subcategories", getSubCategories)

export default Router
