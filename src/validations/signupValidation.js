import Joi from "joi"

export const signupValidationSchema = Joi.object({
    firstname: Joi.string().required().min(2).max(255),
    lastname: Joi.string().required().min(2).max(255),
    email: Joi.string().required().lowercase().email(),
    password: Joi.string().required().min(6),

})