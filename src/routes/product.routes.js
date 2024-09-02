import express from 'express';

import {
  getAllProducts,
  getProductsByCategory,
  getProductsBySubCategory,
  getSingleProduct,
  createProduct,
  deleteProduct,
  updateProductData,
  searchProduct,
} from '../controllers/product.js';
import { isLoggedIn } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';
import { checkUser } from '../middlewares/checkUser.js';

const Router = express.Router();

Router.use(checkUser);

/**
 * @swagger
 * tags:
 *  name: Products
 *  description: Products APIs
 */

/**
 * @swagger
 * /products:
 *    post:
 *      summary: Create product
 *      tags: [Products]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                productClass:
 *                  type: string
 *                category:
 *                  type: string
 *                subCategory:
 *                  type: string
 *                brand:
 *                  type: string
 *                description:
 *                  type: string
 *                stockQuantity:
 *                  type: number
 *                stockLocation:
 *                  type: string
 *                price:
 *                  type: number
 *                currency:
 *                  type: string
 *                discountPercentage:
 *                  type: number
 *                quantityParameter:
 *                  type: string
 *                colorMeasurementVariations:
 *                  type: array
 *                  items:
 *                    type: object
 *                productImages:
 *                  type: array
 *                  items:
 *                    type: string
 *      responses:
 *        200:
 *          description: The updated product object
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 */

Router.post('/', isLoggedIn, restrictTo('admin', 'seller'), createProduct);

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Search for products
 *     tags: [Products]
 *     description: Search for products by name and optionally select specific fields.
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Name of the product to search for
 *         required: true
 *         schema:
 *           type: string
 *       - name: fields
 *         in: query
 *         description: Comma-separated list of fields to include in the response
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with the product search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       description:
 *                         type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

Router.get('/search', searchProduct);

/**
 * @swagger
 * /products:
 *    get:
 *      summary: Get all products.
 *      tags: [Products]
 *      parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items per page.
 *       - in: query
 *         name: sort
 *         schema:
 *          type: string
 *          default: createdAt
 *         description: The field to sort the results by.
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: A comma-separated list of fields to include in the response.
 *      responses:
 *        200:
 *          description: The array of all products.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *
 */
Router.get('/', getAllProducts);

/**
 * @swagger
 * /products/{productId}:
 *    get:
 *      summary: Get the product by its id
 *      tags: [Products]
 *      parameters:
 *        - in: path
 *          name: productId
 *          schema:
 *            type: string
 *          required: true
 *          description: The value from the _id field of the product object
 *      responses:
 *        200:
 *          description: An object of product details with some data from the associated models
 *          contents:
 *            application/json:
 *              schema:
 *                type: object
 */
Router.get('/:productId', getSingleProduct);

/**
 * @swagger
 * /products/{productId}:
 *    patch:
 *      summary: Update product data by its id
 *      tags: [Products]
 *      parameters:
 *        - in: path
 *          name: productId
 *          schema:
 *            type: string
 *          required: true
 *          description: The value from the _id field of the product object
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                productClass:
 *                  type: string
 *                category:
 *                  type: string
 *                subCategory:
 *                  type: string
 *                brand:
 *                  type: string
 *                description:
 *                  type: string
 *                stockQuantity:
 *                  type: number
 *                stockLocation:
 *                  type: string
 *                price:
 *                  type: number
 *                currency:
 *                  type: string
 *                discountPercentage:
 *                  type: number
 *                quantityParameter:
 *                  type: string
 *                colorMeasurementVariations:
 *                  type: array
 *                  items:
 *                    type: object
 *                productImages:
 *                  type: array
 *                  items:
 *                    type: string
 *      responses:
 *        200:
 *          description: The updated product object
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 */
Router.patch('/:productId', isLoggedIn, restrictTo('admin', 'seller'), updateProductData);

/**
 * @swagger
 * /products/category/{categoryId}:
 *    get:
 *      summary: Get products by their category
 *      tags: [Products]
 *      parameters:
 *        - in: path
 *          name: categoryId
 *          schema:
 *            type: string
 *          required: true
 *          description: The value from the _id field of category object
 *      responses:
 *        200:
 *          description: An array of products that belong to the products category of id passed as category id.
 *          contents:
 *            application/json:
 *              schema:
 *                type: array
 */
Router.get('/category/:categoryId', getProductsByCategory);

/**
 * @swagger
 * /products/subcategory/{subcategoryId}:
 *    get:
 *      summary: Get products by their subcategory
 *      tags: [Products]
 *      parameters:
 *        - in: path
 *          name: subcategoryId
 *          schema:
 *            type: string
 *          required: true
 *          description: The value from the _id field of the subcategory object
 *      responses:
 *        200:
 *          description: An array of products that belong to the products subcategory of id passed as subcategory id.
 *          contents:
 *            application/json:
 *              schema:
 *                type: array
 */
Router.get('/subcategory/:subcategoryId', getProductsBySubCategory);

Router.delete('/:productId', isLoggedIn, restrictTo('admin', 'seller'), deleteProduct);

export default Router;
