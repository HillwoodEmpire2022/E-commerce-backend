import Joi from 'joi';

const orderSchemaJoi = Joi.object({
  customer: Joi.string().length(24).hex(),
  phoneNumber: Joi.string(),
  status: Joi.string().valid(
    'awaits payment',
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'transaction failed'
  ),

  shippingAddress: Joi.object({
    country: Joi.string(),
    city: Joi.string(),
    address: Joi.object({
      street: Joi.string(),
      coordinates: Joi.array().items(Joi.number()).length(2),
    }).allow(null),
    geojson: Joi.boolean(),
  }),
});

export default orderSchemaJoi;
