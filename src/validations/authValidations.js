import Joi from "joi";

export const signupValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  password: Joi.string().required().min(8),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .error(new Error("Passwords do not match")),
});

export const loginValidationSchema = Joi.object({
  email: Joi.string().required().lowercase().email(),
  password: Joi.string().required(),
});
