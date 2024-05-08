import express from 'express';

import {
  createProductClass,
  getProductClasses,
} from '../controllers/ProductClass.js';

const Router = express.Router();

Router.post('/', createProductClass);

Router.get('/', getProductClasses);

export default Router;
