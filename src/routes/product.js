import express from "express"

import {  isAdmin } from "../middlewares/auth.js"
import { getAllProducts, getProductsByCategory, getProductsBySubCategory, getSingleProduct, uploadNewProduct } from "../controllers/product.js"
import { upload } from "../utils/multer.js"

const Router = express.Router()

Router.post("/product/upload", 
    isAdmin,
       upload.fields(([
        { name: 'productThumbnail', maxCount: 1 },
        { name: 'otherImages', maxCount: 6 },
        { name: 'colorImages', maxCount: 6 },
      ])),
    uploadNewProduct)
Router.get("/products", getAllProducts) 
Router.get("/product/:productId", getSingleProduct) 
Router.get("/products/category/:categoryId", getProductsByCategory)
Router.get("/products/subcategory/:subcategoryId", getProductsBySubCategory)

export default Router
