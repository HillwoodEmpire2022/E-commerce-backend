import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import passport from "passport";

import { passportConfig } from "./utils/passportConfig.js";
import cookieSession from "cookie-session";
import cookieParser from "cookie-parser";

// Routes
import authRouter from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import subCategoryRouter from "./routes/subcategories.routes.js";
import sprofileRouter from "./routes/profile.routes.js";

const app = express();
dotenv.config();

const clientUrl = process.env.CLIENT_URL;
const clientLocalhostUrl = process.env.CLIENT_LOCALHOST_URL;
const adminClientUrl = process.env.ADMIN_CLIENT_URL;

app.use(express.json({}));

app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(helmet());
if (
  process.env.NODE_ENV === "development" ||
  process.env.NODE_ENV === "production"
) {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: [
      clientUrl,
      clientLocalhostUrl,
      adminClientUrl,
      "https://feliglobalmarkets.netlify.app/",
      "https://admin-feliglobalmakert.vercel.app",
      "https://admin-phi-gules.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

app.use(
  cookieSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: true,
      name: "session_cookie",
      sameSite: "None",
    },
  })
);

app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

passportConfig();

// Routing
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/subcategories", subCategoryRouter);
app.use("/api/v1/profiles", sprofileRouter);
app.use("/api/v1/carts", cartRouter);
app.get("/logout", (req, res) => {
  for (const key in req.session) {
    if (req.session.hasOwnProperty(key)) {
      delete req.session[key];
    }
  }

  req.session = null;
  res.clearCookie("session_cookie");

  res.redirect(302, clientUrl);
});
app.use("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Root (${req.originalUrl}) does not exist.`,
  });
});

export default app;
