import express from "express";

import {
  addCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../controllers/category.js";
import { isLoggedIn } from "../middlewares/authentication.js";
import { restrictTo } from "../middlewares/authorization.js";

const Router = express.Router();

Router.use(isLoggedIn, restrictTo("admin"));

// Categories
/**
 * @swagger
 * tags:
 *  name: Categories
 *  description: Categories APIs
 */

/**
 * @swagger
 * /category/create:
 *    post:
 *      summary: API for creating a new category. Only admin users are given access to this route.
 *      tags: [Categories]
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *       description: Object of new category data to be saved.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  name:
 *                     type: string
 *      responses:
 *        201:
 *          description: Category [category name] added successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *        400:
 *          description: Category [Category name] already exists.
 *        422:
 *          description: Request body validation errors
 */
Router.post("/", addCategory);
/**
 * @swagger
 * /categories:
 *    get:
 *      summary: Retrieve an array of objects for categories
 *      tags: [Categories]
 *      responses:
 *        200:
 *          description: The array of all objects of product categories.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *        404:
 *          description: There is no any category.
 */
Router.get("/", getCategories);
Router.get("/:id", getCategory);
Router.patch("/:id", updateCategory);
Router.delete("/:id", deleteCategory);

export default Router;
