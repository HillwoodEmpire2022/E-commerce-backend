import Category from "../models/category.js";
import SubCategory from "../models/subcategory.js";
import {
  SubCategoryValidation,
  addCategoryValidation,
} from "../validations/productValidation.js";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

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
      return res.status(422).send({ message: error.message });
    }
    const existingSubCategory = await SubCategory.findOne({
      name: req.body.name,
    });
    if (existingSubCategory) {
      return res
        .status(400)
        .send({ message: `Subcategory ${req.body.name} already exists.` });
    }
    const addedSubCategory = await SubCategory.create({
      name: req.body.name,
      category: req.body.categoryId,
    });
    res.status(201).send({
      message: `Subcategory ${addedSubCategory.name} added successfully.`,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const allSubCategories = await SubCategory.find()
      .populate("category")
      .exec();
    if (allSubCategories.length === 0) {
      return res.status(404).send({ message: "There is no any subcategory." });
    }
    res.status(200).json(allSubCategories);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
