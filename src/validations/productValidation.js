import Joi from 'joi';

export const uploadProductValidation = Joi.object({
  name: Joi.string().required().min(2),
  description: Joi.string().required().min(6),
  category: Joi.string().required(),
  subcategory: Joi.string().required(),
  seller: Joi.string().required(),
  price: Joi.number().required().greater(0),
  discountPercentage: Joi.number().integer(),
  stockQuantity: Joi.number().required().greater(0).integer(),
  quantityParameter: Joi.string().required(),
  brandName: Joi.string(),
  availableSizes: Joi.array().items(Joi.string().required()),
});

export const addCategoryValidation = Joi.object({
  name: Joi.string().required().min(2),
});

export const SubCategoryValidation = Joi.object({
  name: Joi.string().required().min(2),
  // Validate valid mongodb id
  category: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/),
});

export const updateProductsValidation = Joi.object({
  name: Joi.string().min(2),
  description: Joi.string().min(6),
  category: Joi.string(),
  subcategory: Joi.string(),
  seller: Joi.string(),
  price: Joi.number().greater(0),
  discountPercentage: Joi.number().integer(),
  stockQuantity: Joi.number().greater(0).integer(),
  quantityParameter: Joi.string(),
  brandName: Joi.string(),
  availableSizes: Joi.array().items(Joi.string()),
});
