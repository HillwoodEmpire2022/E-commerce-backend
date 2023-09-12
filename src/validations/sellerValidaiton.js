import Joi from "joi"

export const sellerValidationSchema = Joi.object({
    firstname: Joi.string().required().trim().min(3),
    lastname: Joi.string().required().trim().min(3),
    email: Joi.string().email(),
    phoneNumber: Joi.string().required().trim(),
    companyName: Joi.string().required(),
    businessAddressCountry: Joi.string().required(),
    businessAddressCity: Joi.string().required(),
    businessStreetAddress: Joi.string().required()
})
