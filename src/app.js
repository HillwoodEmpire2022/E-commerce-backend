import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Routes
import authRouter from './routes/auth.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import cartRouter from './routes/cart.routes.js';
import subCategoryRouter from './routes/subcategories.routes.js';
import sprofileRouter from './routes/profile.routes.js';
import sellerRoute from './routes/seller.routes.js';
import paymentRouter from './routes/payment.routes.js';
import orderRouter from './routes/order.routes.js';

const app = express();
dotenv.config();

const clientUrl = process.env.CLIENT_URL;
const clientLocalhostUrl = process.env.CLIENT_LOCALHOST_URL;
const adminClientUrl = process.env.ADMIN_CLIENT_URL;

app.use(express.json());

app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(helmet());
if (
  process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'production'
) {
  app.use(morgan('dev'));
}

// Cors
app.use(
  cors({
    origin: [
      clientUrl,
      clientLocalhostUrl,
      adminClientUrl,
      'https://feliglobalmarkets.netlify.app',
      'https://admin-feliglobalmakert.vercel.app',
      'https://admin-phi-gules.vercel.app',
      'https://e-commerce-frontend-pi-seven.vercel.app',
      'https://api.flutterwave.com',
      '54.76.248.30',
      '34.254.131.32',
      '34.251.99.7',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
);

// Routing
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/subcategories', subCategoryRouter);
app.use('/api/v1/profiles', sprofileRouter);
app.use('/api/v1/carts', cartRouter);
app.use('/api/v1/sellers', sellerRoute);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/orders', orderRouter);

app.use('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Root (${req.originalUrl}) does not exist.`,
  });
});

export default app;
