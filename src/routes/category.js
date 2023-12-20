import express from "express";

import {
  addCategory,
  addSubCategory,
  deleteCategory,
  deleteSubCategory,
  getCategories,
  getCategory,
  getSubCategories,
  getSubCategory,
  updateCategory,
  updateSubCategory,
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
Router.post("/category/create", addCategory);
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
Router.get("/categories", getCategories);

Router.get("/categories/:id", getCategory);
Router.patch("/categories/:id", updateCategory);
Router.delete("/categories/:id", deleteCategory);

// Subcategories
/**
 * @swagger
 * /subcategory/create:
 *    post:
 *      summary: API for creating a new sub category. Only admin users are given access to this route.
 *      tags: [Categories]
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *       description: Object of new subcategory data; name and category which takes object id of the referenced category.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  name:
 *                     type: string
 *                  categoryId:
 *                     type: string
 *      responses:
 *        201:
 *          description: Subcategory [subcategory name] added successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *        400:
 *          description: Subcategory [subcategory name] already exists.
 *        422:
 *          description: Request body validation errors
 */
Router.post("/subcategory/create", addSubCategory);
/**
 * @swagger
 * /subcategories:
 *    get:
 *      summary: Get Subcategories.
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
Router.get("/subcategories", getSubCategories);
Router.get("/subcategories/:id", getSubCategory);
Router.patch("/subcategories/:id", updateSubCategory);
Router.delete("/subcategories/:id", deleteSubCategory);

export default Router;
