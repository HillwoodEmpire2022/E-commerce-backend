import express from "express"

import {  isAdmin } from "../middlewares/auth.js"
import {
  getAllProducts,
  getProductsByCategory,
  getProductsBySubCategory,
  getSingleProduct,
  uploadNewProduct
} from "../controllers/product.js"
import { upload } from "../utils/multer.js"

const Router = express.Router()


/**
 * @swagger
 * tags:
 *  name: Products
 *  description: Products APIs
 */

Router.post("/product/upload", 
       isAdmin,
       upload.fields([
        { name: 'productThumbnail', maxCount: 1 },
        { name: 'otherImages', maxCount: 6 },
        { name: 'colorImages', maxCount: 6 },
      ]),
  uploadNewProduct)
    
/**
 * @swagger
 * /products:
 *    get:
 *      summary: Returns the array of all products.
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
Router.get("/products", getAllProducts) 

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
Router.get("/product/:productId", getSingleProduct) 

/**
 * @swagger
 * /products/category/{categoryId}:
 *    get:
 *      summary: Get the products by their category
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
Router.get("/products/category/:categoryId", getProductsByCategory)

/**
 * @swagger
 * /products/subcategory/{subcategoryId}:
 *    get:
 *      summary: Get the products by their subcategory
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
Router.get("/products/subcategory/:subcategoryId", getProductsBySubCategory)

export default Router
