import mongoose from 'mongoose';
import Brand from '../models/brand.model.js';
import Category from '../models/category.js';
import ProductClass from '../models/productClass.js';
import SubCategory from '../models/subcategory.js';
import removeEmptySpaces from '../utils/removeEmptySpaces.js';
import { productClassValidation } from '../validations/productClassValidation.js';

export const createProductClass = async (req, res) => {
  try {
    const { error } = productClassValidation.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
      allowUnknown: true,
    });

    if (error) {
      return res.status(400).send({ message: error.message });
    }

    // Check if product class already exist
    const existingProductClass = await ProductClass.findOne({ name: req.body.name });

    if (existingProductClass) {
      return res.status(400).json({ message: 'Product class already exists' });
    }

    const productClass = await ProductClass.create({
      name: removeEmptySpaces(req.body.name),
    });

    return res.status(201).json({
      status: 'success',
      data: {
        productClass,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProductClasses = async (req, res) => {
  try {
    const productClasses = await ProductClass.find()
      .populate({
        path: 'categories',
        select: 'name',
      })
      .populate({
        path: 'brands',
        select: 'name',
      });

    return res.status(201).json({
      status: 'success',
      data: {
        productClasses,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProductClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const productClass = await ProductClass.findById(id);

    if (!productClass) {
      return res.status(404).json({ message: 'Product class not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        productClass,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProductClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedProductClass = await ProductClass.findByIdAndUpdate(
      id,
      { name: removeEmptySpaces(name) },
      { new: true }
    );

    if (!updatedProductClass) {
      return res.status(404).json({ message: 'Product class not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        productClass: updatedProductClass,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProductClass = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await mongoose.startSession();

    const productClass = await ProductClass.findById(id);

    if (!productClass) {
      return res.status(404).json({ message: 'Product class not found' });
    }

    await session.withTransaction(async () => {
      // Get ALl Categories
      const categories = await Category.find({ productClass: id }).session(session);

      // Delete all subcategories belonging to the categories
      for (const category of categories) {
        await SubCategory.deleteMany({ category: category._id }).session(session);
      }

      // Delete all categories belonging to the product class
      await Category.deleteMany({ productClass: id }).session(session);

      // Delete all brands belonging to the product class
      await Brand.deleteMany({ productClass: id }).session(session);

      // Delete the product class
      await ProductClass.deleteOne({ _id: id }).session(session);
    });

    await session.endSession();

    return res.status(200).json({
      status: 'success',
      message: 'Product class deleted successfully',
    });
  } catch (error) {
    console.log('Here', error);

    res.status(500).json({ message: 'Internal server error' });
  }
};
