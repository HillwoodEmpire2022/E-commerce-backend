import express from "express"
import morgan from "morgan"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRoutes from "./routes/auth.js"
import passport from "passport"
import { passportConfig } from "./utils/passportConfig.js"
import sellerRoutes from "./routes/seller.js"
import categoryRoutes from "./routes/category.js"
import productRoutes from "./routes/product.js"
import swaggerUI from "swagger-ui-express"
import { specs } from "./utils/swaggerDocsSpecs.js"


dotenv.config()

const app = express()

app.use(express.json({}))
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(cors({
    origin: ["*"]
}))
app.use(morgan("common"))

passportConfig()

app.use(passport.initialize())

//route handlers
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))
app.use(authRoutes)
app.use(sellerRoutes)
app.use(categoryRoutes)
app.use(productRoutes, (error, req, res, next) => {
    res.status(500).send({ error: error })
  })

const PORT = process.env.PORT || 3000

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () => { 
        console.log(`Server connected on port ${PORT}`)
    })
}).catch((error) => { console.log({ error: error.message }) })
