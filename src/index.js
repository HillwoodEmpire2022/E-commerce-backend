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
import cookieSession from "cookie-session"



dotenv.config()

const app = express()

app.use(cors({
    origin: ["https://classy-salamander-0a7429.netlify.app", "http://localhost:3000"], 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE"],
  }));

app.use(express.json({}))
app.use(express.urlencoded({ extended: true }))
app.use(helmet())

app.use(morgan("common"))

passportConfig()

app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY],
}))

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    if (req.session && !req.session.regenerate) {
        req.session.regenerate = (cb) => {
            cb()
        }
    }
    if (req.session && !req.session.save) {
        req.session.save = (cb) => {
            cb()
        }
    }
    next()
})

//route handlers
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))
app.use(authRoutes, (error, req, res, next) => {
    res.status(500).json({ error: error.message });
})


app.use(sellerRoutes)
app.use(categoryRoutes)
app.use(productRoutes, (error, req, res, next) => {
    res.status(500).send({ error: error })
  })

const PORT = process.env.PORT || 3000

let databaseUrl = process.env.DEVELOPMENT_MONGODB_URI
if (process.env.NODE_ENVIRONMENT === 'production') {
    databaseUrl = process.env.PRODUCTION_MONGODB_URI
}
mongoose.connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () => { 
        console.log(`Server connected on port ${PORT}`)
    })
}).catch((error) => { console.log({ error: error.message }) })
