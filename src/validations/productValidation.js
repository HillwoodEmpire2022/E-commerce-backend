import Joi from "joi"

export const uploadProductValidation = Joi.object({
    name: Joi.string().required().min(2),
    description: Joi.string().required().min(6),
    category: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    subcategory: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    seller: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    price: Joi.number().required().greater(0),
    discountPercentage: Joi.number().required().integer(),
    stockQuantity: Joi.number().required().greater(0).integer(),
    quantityParameter: Joi.string().required(),
    brandName: Joi.string()
})

export const addCategoryValidation = Joi.object({
    name: Joi.string().required().min(2)
})

export const SubCategoryValidation = Joi.object({
    name: Joi.string().required().min(2),
    categoryId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
})
