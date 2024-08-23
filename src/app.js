import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import swaggerUI from 'swagger-ui-express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';

// Routes
import authRouter from './routes/auth.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import subCategoryRouter from './routes/subcategories.routes.js';
import sprofileRouter from './routes/profile.routes.js';
import sellerRoute from './routes/seller.routes.js';
import paymentRouter from './routes/payment.routes.js';
import orderRouter from './routes/order.routes.js';
import userRouter from './routes/user.routes.js';
import productClassRouter from './routes/productClass.routes.js';
import brandsRouter from './routes/brand.routes.js';
import { specs } from './utils/swaggerDocsSpecs.js';
import globalErrorHandler from './controllers/globalErrorHandler.js';
import AppError from './utils/AppError.js';

const app = express();

const clientUrl = process.env.CLIENT_URL;
const clientLocalhostUrl = process.env.CLIENT_LOCALHOST_URL;
const adminClientUrl = process.env.ADMIN_CLIENT_URL;

app.use(
  express.json({
    verify: (req, res, buf, encoding) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'https:'], // Allow all https resources
      },
    },
  })
);

app.use(morgan('dev'));

// Cors
app.use(
  cors({
    origin: [
      clientUrl,
      clientLocalhostUrl,
      adminClientUrl,
      'https://e-commerce-frontend-pi-seven.vercel.app',
      'https://webhook.site',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
);

// Routing
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/subcategories', subCategoryRouter);
app.use('/api/v1/profiles', sprofileRouter);
app.use('/api/v1/sellers', sellerRoute);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/product-classes', productClassRouter);
app.use('/api/v1/brands', brandsRouter);

app.use('*', (req, res, next) => {
  next(new AppError(`Route ${req.baseUrl} not found.`, 404));
});

app.use(globalErrorHandler);

export default app;
