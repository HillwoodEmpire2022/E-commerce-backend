import express from "express"

import {  isAdmin } from "../middlewares/auth.js"
import { addCategory, addSubCategory, getCategories, getSubCategories } from "../controllers/category.js"

const Router = express.Router()

/**
 * @swagger
 * tags:
 *  name: Categories
 *  description: Categories APIs
 */

Router.post("/category/create", isAdmin, addCategory)

/**
 * @swagger
 * /categories:
 *    get:
 *      summary: Returns the array of all product categories.
 *      tags: [Categories]
 *      responses:
 *        200:
 *          description: The array of all product categories.
 *          content: 
 *            application/json:
 *              schema:
 *                type: array
 *        404:
 *          description: There is no any category.                  
 */ 
Router.get("/categories", getCategories)
Router.post("/subcategory/create", isAdmin, addSubCategory)

/**
 * @swagger
 * /subcategories:
 *    get:
 *      summary: Returns the array of all product subcategories.
 *      tags: [Categories]
 *      responses:
 *        200:
 *          description: The array of all product subcategories.
 *          content: 
 *            application/json:
 *              schema:
 *                type: array
 *        404:
 *          description: There is no any subcategory.                  
 */ 
Router.get("/subcategories", getSubCategories)

export default Router
