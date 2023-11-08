import Joi from "joi"

export const addToCartValidation = Joi.object({
    product: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    colorId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    size: Joi.string().required(),
    deliveryFee: Joi.number().required(),
    quantity: Joi.number().required().min(1),
})

export const updateCartValidation = Joi.object({
    colorId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    size: Joi.string(),
    deliveryFee: Joi.number(),
    quantity: Joi.number().min(1),
})
