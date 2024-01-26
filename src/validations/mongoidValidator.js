import Joi from 'joi';

export const MongoIDValidator = Joi.object({
  productId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .error(new Error('Invalid Id')),
});

export const mongoIdValidator = Joi.object({
  id: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .error(new Error('Invalid Id')),
});
