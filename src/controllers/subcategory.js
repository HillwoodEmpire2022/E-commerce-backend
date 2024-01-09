import Category from '../models/category.js';
import SubCategory from '../models/subcategory.js';
import { SubCategoryValidation } from '../validations/productValidation.js';
import removeEmptySpaces from '../utils/removeEmptySpaces.js';

// ******** Subcategories ***********
// Create Sub-categories
export const addSubCategory = async (req, res) => {
  try {
    const { error } = SubCategoryValidation.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
    });

    if (error) {
      return res.status(404).json({
        status: 'fail',
        message: error.message,
      });
    }

    const subcategoryData = {
      ...req.body,
      name: removeEmptySpaces(req.body.name),
    };

    // Check if Category Exist
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        status: 'fail',
        message:
          'No category found for subcategory you are creating.',
      });
    }

    const subcategory = await SubCategory.findOne({
      name: subcategoryData.name,
    });
    if (subcategory) {
      return res.status(400).json({
        status: 'fail',
        message: 'Subcategory already exists.',
      });
    }

    const subCategory = await SubCategory.create({
      name: subcategoryData.name,
      category: category._id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        subCategory,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get Sub-categories
export const getSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({}, [
      '-updatedAt',
      '-createdAt',
    ])
      .populate({
        path: 'category',
        select: '-updatedAt -createdAt',
      })
      .exec();

    res.status(200).json({
      status: 'success',
      data: {
        subCategories,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// Get Sub-category
export const getSubCategory = async (req, res) => {
  try {
    const category = await SubCategory.findById(
      req.params.id
    ).populate('category', ['id', 'name']);

    if (!category) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Sub-category not found' });
    }

    // Send the found sub category as a response
    res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' });
  }
};

// Update Sub-category
export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedSubCategory) {
      return res
        .status(404)
        .json({ status: '404', message: 'SubCategory not found' });
    }

    res.status(200).json({
      status: 'success',
      data: updatedSubCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'fail',
      message: 'Error updating SubCategory',
    });
  }
};

// Delete Sub-category
export const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(
      req.params.id
    );

    if (!subCategory) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Subcategory not found' });
    }

    // Send the found category as a response
    res.status(204).json({
      status: 'success',
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' });
  }
};
