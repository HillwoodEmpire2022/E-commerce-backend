import express from 'express';
import {
  addSubCategory,
  deleteSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
} from '../controllers/subcategory.js';
import { isLoggedIn } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router();

router.get('/', getSubCategories);
router.use(isLoggedIn, restrictTo('admin'));
router.post('/', addSubCategory);
router.get('/:id', getSubCategory);
router.patch('/:id', updateSubCategory);
router.delete('/:id', deleteSubCategory);

export default router;
