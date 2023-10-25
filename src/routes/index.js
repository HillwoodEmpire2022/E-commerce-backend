import express from "express"
import authRoutes from "./auth.js"
import sellerRoutes from "./seller.js"
import categoryRoutes from "./category.js"
import productRoutes from "./product.js"
import swaggerUI from "swagger-ui-express"
import { specs } from "./../utils/swaggerDocsSpecs.js"

const app = express()


//route handlers
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))
app.use(authRoutes)
app.use(sellerRoutes)
app.use(categoryRoutes)
app.use(productRoutes)

export default app;
