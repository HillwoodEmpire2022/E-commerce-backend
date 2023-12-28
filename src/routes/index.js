import express from "express";
import cors from "cors";
import authRoutes from "./auth.js";
import sellerRoutes from "./seller.js";
import categoryRoutes from "./category.js";
import productRoutes from "./product.js";
import cartRoutes from "./cart.js";
import swaggerUI from "swagger-ui-express";
import { specs } from "../utils/swaggerDocsSpecs.js";

const app = express();

const clientUrl = process.env.CLIENT_URL;
const clientLocalhostUrl = process.env.CLIENT_LOCALHOST_URL;
const adminClientUrl = process.env.ADMIN_CLIENT_URL;

app.use(
  cors({
    origin: [clientUrl, clientLocalhostUrl, adminClientUrl],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

//route handlers
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
app.use(authRoutes);
app.use(sellerRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(categoryRoutes);

export default app;
