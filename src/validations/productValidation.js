import Joi from "joi"

export const uploadProductValidation = Joi.object({
    name: Joi.string().required().min(2),
    description: Joi.string().required().min(6),
    price: Joi.number().required().greater(0),
    discountPercentage: Joi.number().greater(0).integer(),
    stockQuantity: Joi.number().required().greater(0).integer(),
    quantityParameter: Joi.string().required(),
    brandName: Joi.string()
})
