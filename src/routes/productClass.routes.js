import express from 'express';

import {
  createProductClass,
  deleteProductClass,
  getProductClassById,
  getProductClasses,
  updateProductClass,
} from '../controllers/ProductClass.js';
import { isLoggedIn } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Product Classes
 *   description: API endpoints for managing product classes
 */

/**
 * @swagger
 * /product-classes:
 *   get:
 *     summary: Get all product classes
 *     tags: [Product Classes]
 *     responses:
 *       200:
 *         description: Returns an array of product classes
 */
Router.get('/', getProductClasses);

/**
 * @swagger
 * /product-classes/{id}:
 *   get:
 *     summary: Get a product class by ID
 *     tags: [Product Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product class
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the product class with the specified ID
 *       404:
 *         description: Product class not found
 */
Router.get('/:id', getProductClassById);

/**
 * @swagger
 * /product-classes:
 *   post:
 *     summary: Create a new product class
 *     tags: [Product Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductClass'
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The email address to send the verification email to.
 *                 example: Clothing
 *     responses:
 *       201:
 *         description: Product class created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
Router.post(
  '/',
  isLoggedIn,
  restrictTo('admin'),
  createProductClass
);

/**
 * @swagger
 * /product-classes/{id}:
 *   patch:
 *     summary: Update a product class by ID
 *     tags: [Product Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product class
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductClass'
 *     responses:
 *       200:
 *         description: Product class updated successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product class not found
 */
Router.patch(
  '/:id',
  isLoggedIn,
  restrictTo('admin'),
  updateProductClass
);

/**
 * @swagger
 * /product-classes/{id}:
 *   delete:
 *     summary: Delete a product class by ID
 *     tags: [Product Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product class
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Product class deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product class not found
 */
Router.delete(
  '/:id',
  isLoggedIn,
  restrictTo('admin'),
  deleteProductClass
);

export default Router;
