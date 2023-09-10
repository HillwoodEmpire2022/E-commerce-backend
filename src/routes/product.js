import express from "express"

import {  isAdmin } from "../middlewares/auth.js"
import { uploadNewProduct } from "../controllers/product.js"
import { upload } from "../utils/multer.js"

const Router = express.Router()

Router.post("/product/upload", 
    upload.single("productThumbnail"),
    upload.array("otherImages", 6),
    upload.array("colorImages", 6),
    isAdmin,
    uploadNewProduct)

export default Router