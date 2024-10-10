import Category from '../models/category.js';

import { addCategoryValidation } from '../validations/productValidation.js';
import removeEmptySpaces from '../utils/removeEmptySpaces.js';
import SubCategory from '../models/subcategory.js';
import { extractUserAgentdata, createdActivityLog } from '../utils/createActivityLog.js';

async function createActivityLogs(category_id, req, doer, type, action, details, status) {
  const { ipAddress, browser, os } = extractUserAgentdata(req);

  const activity = {
    userId: doer?._id,
    activity: {
      type,
      action,
    },

    resource: {
      name: 'categories',
      id: category_id,
    },

    details,
    status,

    ipAddress,
    userAgent: {
      browser: `${browser.name} ${browser.version}`,
      os: ` ${os.name} ${os.version}`,
    },
  };

  await createdActivityLog(activity);
}

// ******** Categories ***********
// Create Categories
export const addCategory = async (req, res) => {
  try {
    const { error } = addCategoryValidation.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
    });
    if (error) {
      return res.status(422).send({ message: error.message });
    }

    const categoryData = {
      ...req.body,
      name: removeEmptySpaces(req.body.name),
    };

    const existingCategory = await Category.findOne({
      name: categoryData.name,
    });
    if (existingCategory) {
      return res.status(400).send({
        message: `Category ${req.body.name} already exists.`,
      });
    }
    const category = await Category.create({
      name: categoryData.name,
      productClass: categoryData.productClass,
    });

    await createActivityLogs(
      category.id,
      req,
      req.user._id,
      'system',
      'category_created',
      `A new category: ${category.name} has been created`,
      'success'
    );

    res.status(201).json({
      status: 'success',
      data: {
        category,
      },
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}, ['-updatedAt', '-createdAt'])
      .populate({
        path: 'subCategories',
        select: 'name brands',
      })
      .exec();

    res.status(200).json({
      status: 'sucess',
      data: {
        categories,
      },
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Ge Category
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found',
      });
    }

    // Send the found category as a response
    res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updatedData,
      { new: true } // Return the updated document
    );

    if (!updatedCategory) {
      return res.status(404).json({ status: '404', message: 'Category found' });
    }

    await createActivityLogs(
      id,
      req,
      req.user._id,
      'system',
      'category_updated',
      `Category: ${updatedCategory.name} has been updated`,
      'success'
    );

    res.status(200).json({
      status: 'success',
      data: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'fail',
      message: 'Error updating SubCategory',
    });
  }
};

// Delete Categories
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found',
      });
    }

    // Delete All Subcategories
    await SubCategory.deleteMany({
      category: req.params.id,
    });

    await createActivityLogs(
      req.params.id,
      req,
      req.user._id,
      'system',
      'category_deleted',
      `Category: ${category.name} has been deleted. This includes all its subcategories`,
      'success'
    );

    // Send the found category as a response
    res.status(200).json({
      status: 'success',
    });
  } catch (error) {
    next(error);
  }
};
