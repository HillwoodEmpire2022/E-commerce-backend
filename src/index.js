import express from "express"
import morgan from "morgan"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import mongoose from "mongoose"
import passport from "passport"
import { passportConfig } from "./utils/passportConfig.js"
import cookieSession from "cookie-session"
import apiRoutes from "./routes/index.js"

dotenv.config()

const app = express()
const clientUrl = process.env.CLIENT_URL
const clientLocalhostUrl = process.env.CLIENT_LOCALHOST_URL

app.use(cors({
    origin: [clientUrl, clientLocalhostUrl], 
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
app.use(apiRoutes, (error, req, res, next) => {
    res.status(500).json({ error: error.message });
})

// Routes for Google OAuth
app.get("/auth/google", passport.authenticate("google", {
    scope: ["email", "profile"]
}));
 
app.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: clientUrl,
        failureRedirect: "/auth/google/failure",
        failureMessage: "Cannot login to google, please try again later",
    }),
    ((req, res) => {     
        res.send("Signed in successfully!")
    })
);

app.get("/auth/google/failure", (req, res) => {
    res.status(401).json({
        message: "Unable to sign in using Google, please try again later",
    });
});

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
