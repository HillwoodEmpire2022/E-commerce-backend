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
import cookieParser from "cookie-parser"


const app = express()
dotenv.config()

const clientUrl = process.env.CLIENT_URL
const clientLocalhostUrl = process.env.CLIENT_LOCALHOST_URL

app.use(express.json({}))

app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(morgan("common"))

app.use(cors({
    origin: [clientUrl, clientLocalhostUrl], 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE"],
}));


app.use(cookieSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { 
        secure: true,
        name: 'session_cookie'
    }
}))

app.use(function(request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb) => {
            cb()
        }
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb()
        }
    }
    next()
})

app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())

passportConfig()


app.use(apiRoutes, (error, req, res, next) => {
    console.log(`Error Occurs: ${error.message}`);
    res.status(500).json({ error: error.message });
})


app.get('/logout', (req, res) => {

    for (const key in req.session) {
        if (req.session.hasOwnProperty(key)) {
            delete req.session[key];
        }
    }

    req.session = null;
    res.clearCookie('session_cookie');

    res.redirect(302, clientUrl); 

});

const PORT = process.env.PORT || 3000

let databaseUrl = process.env.DEVELOPMENT_MONGODB_URI
if (process.env.NODE_ENVIRONMENT === 'production') {
    databaseUrl = process.env.PRODUCTION_MONGODB_URI
}
mongoose.connect(databaseUrl).then(() => {
    app.listen(PORT, () => { 
        console.log(`Server connected on port ${PORT}`)
    })
}).catch((error) => { console.log({ error: error.message }) })
