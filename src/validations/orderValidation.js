import Joi from 'joi';

const orderJoiSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),
        seller: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().required(),
        productThumbnail: Joi.string().required(),
        variation: Joi.object({
          color: Joi.string().allow(null, '').optional(),
          size: Joi.string().allow(null, '').optional(),
        }).optional(),
        seller: Joi.string().required(),
        sellerPaymentStatus: Joi.string()
          .valid('due', 'settled')
          .default('due'),
      })
    )
    .required(),

  customer: Joi.string().required(),
  paymentphoneNumber: Joi.string().required(),
  amount: Joi.number().required(),
  status: Joi.string()
    .valid(
      'awaits payment',
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'transaction failed'
    )
    .default('awaits payment'),
  shippingAddress: Joi.object({
    phoneNumber: Joi.string().required(),
    country: Joi.string().allow(null, '').optional(),
    province: Joi.string().allow(null, '').optional(),
    district: Joi.string().allow(null, '').optional(),
    sector: Joi.string().allow(null, '').optional(),
    cell: Joi.string().allow(null, '').optional(),
    village: Joi.string().allow(null, '').optional(),
    address: Joi.object({
      street: Joi.string().allow(null, '').optional(),
      coordinates: Joi.array().items(Joi.number()).length(2).optional(),
    }).optional(),
    geojson: Joi.boolean().optional(),
  }).optional(),
  deliveryPreference: Joi.string().valid('delivery', 'pickup').required(),
});

export default orderJoiSchema;
