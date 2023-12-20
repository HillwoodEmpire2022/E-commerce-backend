import Category from "../models/category.js";
import SubCategory from "../models/subcategory.js";
import {
  SubCategoryValidation,
  addCategoryValidation,
} from "../validations/productValidation.js";

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

export const addSubCategory = async (req, res) => {
  try {
    const { error } = SubCategoryValidation.validate(req.body, {
      errors: { label: "key", wrap: { label: false } },
    });

    if (error) {
      return res.status(404).json({
        status: "fail",
        message: error.message,
      });
    }

    const category = await SubCategory.create({
      name: req.body.name,
      category: req.body.category,
    });

    res.status(201).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find().populate("category").exec();

    res.status(200).json({
      status: "success",
      data: {
        subCategories,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};
