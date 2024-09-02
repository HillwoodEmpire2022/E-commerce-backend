import Joi from 'joi';

export const uploadProductValidation = Joi.object({
  name: Joi.string().required().min(2),
  description: Joi.string().required().min(6),
  featured: Joi.object({
    isFeatured: Joi.boolean().required(),
    featuredImage: Joi.string().uri().required(),
  }),
  productClass: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .error(new Error('productClass is Invalid or not provided')),
  category: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .error(new Error('Category is Invalid or not provided')),
  subCategory: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .error(new Error('SubCategory is Invalid')),
  seller: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .error(new Error('Seller is Invalid or not provided')),
  price: Joi.number().required().greater(0),
  Percentage: Joi.number().integer(),
  stockQuantity: Joi.number().required().greater(0).integer(),
  brand: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .error(new Error('Invalid brand Id')),

  productImages: Joi.object({
    productThumbnail: Joi.object({
      url: Joi.string()
        .uri()
        .regex(/\.(jpg|jpeg|png|gif|webp)$/i)
        .required()
        .error(new Error('Invalid product thumbnail url')),
    }).required(),

    otherImages: Joi.array().items(
      Joi.object({
        url: Joi.string()
          .uri()
          .regex(/\.(jpg|jpeg|png|gif|webp)$/i)
          .required()
          .error(new Error('Invalid product image url')),
      })
    ),
  }).required(),
});

export const addCategoryValidation = Joi.object({
  name: Joi.string().required().min(2),
  productClass: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .error(new Error('productClass is Invalid or not provided')),
});

export const SubCategoryValidation = Joi.object({
  name: Joi.string().required().min(2),
  // Validate valid mongodb id
  category: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/),
});

export const updateProductsValidation = Joi.object({
  name: Joi.string().min(2),
  description: Joi.string().min(6),
  category: Joi.string(),
  subCategory: Joi.string(),
  seller: Joi.string(),
  price: Joi.number().greater(0),
  featured: Joi.object({
    isFeatured: Joi.boolean().required(),
    image: Joi.string().uri().required(),
  }),
  discountPercentage: Joi.number().integer(),
  stockQuantity: Joi.number().greater(0).integer(),
  stockQuantity: Joi.number().greater(0).integer(),
  brand: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .error(new Error('Brand is Invalid or not provided')),
  productClass: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .error(new Error('productClass is Invalid or not provided')),
});
