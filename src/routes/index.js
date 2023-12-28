import express from "express";
import authRoutes from "./auth.js";
import categoryRoutes from "./category.js";
import productRoutes from "./product.js";
import cartRoutes from "./cart.js";
import swaggerUI from "swagger-ui-express";
import { specs } from "../utils/swaggerDocsSpecs.js";

const app = express();

//route handlers
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
app.use(authRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(categoryRoutes);

export default app;
