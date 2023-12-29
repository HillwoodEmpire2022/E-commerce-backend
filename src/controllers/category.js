import Category from "../models/category.js";
import SubCategory from "../models/subcategory.js";
import {
  SubCategoryValidation,
  addCategoryValidation,
} from "../validations/productValidation.js";

// ******** Categories ***********
// Create Categories
export const addCategory = async (req, res) => {
  try {
    const { error } = addCategoryValidation.validate(req.body, {
      errors: { label: "key", wrap: { label: false } },
    });
    if (error) {
      return res.status(422).send({ message: error.message });
    }
    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      return res
        .status(400)
        .send({ message: `Category ${req.body.name} already exists.` });
    }
    const category = await Category.create({ name: req.body.name });

    res.status(201).json({
      status: "success",
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
    const categories = await Category.find().populate("subCategories").exec();

    res.status(200).json({
      status: "sucess",
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
      return res
        .status(404)
        .json({ status: "fail", message: "Category not found" });
    }

    // Send the found category as a response
    res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
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
      return res.status(404).json({ status: "404", message: "Category found" });
    }

    res.status(200).json({
      status: "success",
      data: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "fail", message: "Error updating SubCategory" });
  }
};

// Delete Categories
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ status: "fail", message: "Category not found" });
    }

    // Send the found category as a response
    res.status(204).json({
      status: "success",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
