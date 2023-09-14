import express from "express"

import {  isAdmin } from "../middlewares/auth.js"
import { getAllProducts, getProductsByCategory, getProductsBySubCategory, getSingleProduct, uploadNewProduct } from "../controllers/product.js"
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
 *      summary: Get the product by id
 *      tags: [Products]
 *      parameters:
 *        - in: path
 *          name: productId
 *          schema:
 *            type: string
 *          required: true
 *          description: The product id
 *      responses:
 *        200:
 *          description: An object of product details with some data from the associated models
 *          contents:
 *            application/json:
 *              schema: 
 *                type: object
 */
Router.get("/product/:productId", getSingleProduct) 

Router.get("/products/category/:categoryId", getProductsByCategory)
Router.get("/products/subcategory/:subcategoryId", getProductsBySubCategory)

export default Router
