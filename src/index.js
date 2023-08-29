import express from "express"
import morgan from "morgan"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRoutes from "./routes/auth.js"
import passport from "passport"
import { passportConfig } from "./utils/passportConfig.js"
import session from "express-session"

dotenv.config()

const app = express()
passportConfig()

app.use(express.json({}))
app.use(helmet())
app.use(cors())
app.use(morgan("common"))
app.use(authRoutes)

const PORT = process.env.PORT || 3001

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () => { 
        console.log(`Server connected on port ${PORT}`)
    })
}).catch((error) => { console.log({ error: error.message }) })

// app.use(session({ 
//     secret: "",
//     resave: false,
//     saveUninitialized: false,
// }))

app.use(passport.initialize())
// app.use(passport.session())
