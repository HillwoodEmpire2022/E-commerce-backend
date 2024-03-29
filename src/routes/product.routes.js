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

/**
 * @swagger
 * tags:
 *  name: Products
 *  description: Products APIs
 */

Router.post('/', isLoggedIn, restrictTo('admin', 'seller'), createProduct);

/**
 * @swagger
 * /products:
 *    get:
 *      summary: Get all products.
 *      tags: [Products]
 *      responses:
 *        200:
 *          description: The array of all products.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *
 */
Router.get('/', checkUser, getAllProducts);

/**
 * @swagger
 * /product/{productId}:
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

Router.patch('/:productId', isLoggedIn, updateProductData);

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
Router.delete(
  '/:productId',
  isLoggedIn,
  restrictTo('admin', 'seller'),
  deleteProduct
);
Router.post('/search', searchProduct);

export default Router;
