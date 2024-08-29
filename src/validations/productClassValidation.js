import Joi from 'joi';

export const productClassValidation = Joi.object({
  name: Joi.string().required().min(2),
  icon: Joi.string().required().min(3),
});
