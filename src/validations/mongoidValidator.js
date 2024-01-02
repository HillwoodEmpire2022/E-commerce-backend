import Joi from "joi";

export const MongoIDValidator = Joi.object({
  productId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .error(
      new Error("Product ID is invalid. Please, provide a valid mongodb ID")
    ),
});
