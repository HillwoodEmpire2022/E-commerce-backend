import Joi from "joi"

export const cartValidation = Joi.object({
    product: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    colorId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    size: Joi.string().required(),
    deliveryFee: Joi.number().required(),
    quantity: Joi.number().required(),
})


