import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoSanitizer from 'express-mongo-sanitize';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import swaggerUI from 'swagger-ui-express';
dotenv.config();

import rateLimiter from 'express-rate-limit';

// Routes
import globalErrorHandler from './controllers/globalErrorHandler.js';
import activityLogsRouter from './routes/activitylogs.routes.js';
import authRouter from './routes/auth.routes.js';
import brandsRouter from './routes/brand.routes.js';
import categoryRouter from './routes/category.routes.js';
import orderRouter from './routes/order.routes.js';
import paymentRouter from './routes/payment.routes.js';
import productRouter from './routes/product.routes.js';
import productClassRouter from './routes/productClass.routes.js';
import sprofileRouter from './routes/profile.routes.js';
import sellerRoute from './routes/seller.routes.js';
import subCategoryRouter from './routes/subcategories.routes.js';
import userRouter from './routes/user.routes.js';
import userProfileRouter from './routes/userProfile.routes.js';
import AppError from './utils/AppError.js';
import { specs } from './utils/swaggerDocsSpecs.js';

const app = express();

const clientUrl = process.env.CLIENT_URL;
const clientLocalhostUrl = process.env.CLIENT_LOCALHOST_URL;
const adminClientUrl = process.env.ADMIN_CLIENT_URL;

// Setting Http Security Headers
app.use(helmet());

// Rate Limitting
const limiter = rateLimiter({
  // 15(Minutes) * 60 seconds * 1000 milliseconds
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // `X-RateLimit-*` headers
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '15kb',
    verify: (req, res, buf, encoding) => {
      req.rawBody = buf;
    },
  })
);

// Data Sanitization against NoSQL query injection
app.use(mongoSanitizer());

// Prevent Parameter Polution
app.use(
  hpp({
    whitelist: [
      'name',
      'email',
      'phone',
      'address',
      'city',
      'country',
      'status',
      'stockQantity',
      'user',
      'product',
      'category',
      'subcategory',
      'seller',
      'payment',
      'order',
      'productClass',
      'price',
      'createdAt',
      'updatedAt',
      'amount',
      'quantity',
    ],
  })
);

app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
app.use('/api/v1/user-profiles', userProfileRouter);
app.use('/api/v1/activity-logs', activityLogsRouter);

app.use('*', (req, res, next) => {
  next(new AppError(`Route ${req.baseUrl} not found.`, 404));
});

app.use(globalErrorHandler);

export default app;
