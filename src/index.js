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
}))

app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())

passportConfig()

// app.get("/logout", function(req, res) {
//     try {
//         req.session = null
//         req.user = null
//         // req.logOut(); 
        

//         res.status(200).send("Logged out"); 
//     } catch (error) {
//         console.error("Error during logout:", error);
//         res.status(500).send("Error during logout");
//     }
// });

app.use(apiRoutes, (error, req, res, next) => {
    res.status(500).json({ error: error.message });
})


app.get('/logout', (req, res) => {

    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        }
        console.log(req.session.isPopulated);
      res.redirect(clientUrl); 
    });
});

// app.get("/logout", function(req,res,next){
//     req.logout(function (err) {
//         console.log("logged out");
//       if (err)
//       {
//         return next(err);
//       }
//       res.send("done");
//     });
// });
  



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
