import Joi from 'joi';

// Create a schema for updating user data where certain fields are forbidden
export const updateUserSchema = Joi.object({
  email: Joi.string().forbidden(),
  password: Joi.string().forbidden(),
  role: Joi.string().valid('admin', 'seller', 'customer'),
}).min(1); // At least one field must be present
