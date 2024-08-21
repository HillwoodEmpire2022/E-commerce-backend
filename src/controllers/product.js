import Product from '../models/product.js';
import User from '../models/user.js';
import APIFeatures from '../utils/APIFeatures.js';
import { MongoIDValidator } from '../validations/mongoidValidator.js';
import { updateProductsValidation, uploadProductValidation } from '../validations/productValidation.js';
import Category from '../models/category.js';
import SubCategory from '../models/subcategory.js';
import removeEmptySpaces from '../utils/removeEmptySpaces.js';
import ProductClass from '../models/productClass.js';
import Brand from '../models/brand.model.js';
import AppError from '../utils/AppError.js';
import { strictTransportSecurity } from 'helmet';

export const getAllProducts = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin' ? true : false;

    const query = {
      ...req.query,
      ...(req?.query?.fields &&
        !req.query.fields.includes('absorbCustomerCharge') && { fields: `${req.query.fields},absorbCustomerCharge` }),
    };

    const queryObj = {};
    let products;
    if (req?.user?.role === 'seller') queryObj.seller = req.user._id;

    // EXECUTE QUERY
    let features = new APIFeatures(
      isAdmin ? Product.find(queryObj).select('+seller_commission') : Product.find(queryObj),
      query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    products = await features.query;

    res.status(200).json({
      status: 'success',
      count: products.length,
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleProduct = async (req, res, next) => {
  try {
    let product;
    const isAdmin = req.user && req.user.role === 'admin' ? true : false;
    // 1) Validate user data
    const { error } = MongoIDValidator.validate(req.params, {
      errors: { label: 'key', wrap: { label: false } },
    });

    if (error) {
      return next(new AppError(error.message, 400));
    }

    product = isAdmin
      ? await Product.findOne({
          _id: req.params.productId,
        }).select('+seller_commission')
      : await Product.findOne({ _id: req.params.productId });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.categoryId,
    });

    if (products.length === 0) {
      return res.status(404).send({
        message: 'No products belonging in this category.',
      });
    }
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductsBySubCategory = async (req, res) => {
  try {
    const products = await Product.find({
      subCategory: req.params.subcategoryId,
    });

    if (products.length === 0) {
      return res.status(404).send({
        message: 'No products belonging in this sub category.',
      });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// delete product
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    // 1) Validate user data
    const { error } = MongoIDValidator.validate(req.params, {
      errors: { label: 'key', wrap: { label: false } },
    });

    if (error) {
      return next(new AppError(error.message, 400));
    }

    // 2) find product by id
    const product = await Product.findById({
      _id: productId,
    });

    // 3) check if the product exists
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // 4) check if the user is admin and the product is the owner of product
    if (product.seller.toString() !== req.user._id.toString() && req.user.role != 'admin') {
      return next(new AppError('You are not the owner of this product', 403));
    }

    // 5) delete product if it is exist
    await Product.deleteOne({ _id: productId });

    return res.status(201).json({
      message: 'product deleted succesfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductData = async (req, res, next) => {
  try {
    const { error } = updateProductsValidation.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
      allowUnknown: true,
    });

    if (error) {
      return next(new AppError(error.message, 400));
    }

    const isUserAdmin = req.user.role === 'admin';

    // If Update include seller, require admin to perform operation
    if (req.body.seller && !isUserAdmin) {
      return next(new AppError('Access denied! You are not allowed to perform this operation.', 403));
    }

    // If Update include customer_commission and seller_commission require admin to perform operation
    if (req.body.seller_commission && !isUserAdmin) {
      return next(new AppError('Access denied! You are not allowed to perform this operation.', 403));
    }

    const product = await Product.findById(req.params.productId);

    if (!product) return next(new AppError('Product not found', 404));

    // Check if product belongs to the user, if user updating the product is not an admin
    if (!isUserAdmin && product.seller.toHexString() !== req.user.id)
      return next(new AppError('Access denied! You cannot update a product that does not belong to you.', 403));

    const updatedProduct = await Product.findByIdAndUpdate(req.params.productId, req.body, {
      new: strictTransportSecurity,
    });

    res.status(200).json({
      status: 'success',
      data: {
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// user search product
export const searchProduct = async (req, res, next) => {
  const query = req.query;
  const searchItem = req.query.name;

  // Selecting certain fields (projection)
  const projection = query.fields
    ? query.fields.split(',').reduce((acc, field) => {
        return { ...acc, [field]: 1 };
      }, {})
    : null;

  try {
    const aggregationPipeline = [
      {
        $search: {
          index: 'product_full_text_search',
          text: {
            query: searchItem,
            path: ['name'],
            fuzzy: {
              maxEdits: 2,
            },
          },
        },
      },

      {
        $addFields: {
          id: '$_id',
        },
      },
    ];

    // If there is rq.query.fields, add a projection stage to the pipeline
    if (projection) aggregationPipeline.push({ $project: projection });

    const products = await Product.aggregate(aggregationPipeline);

    return res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { error } = uploadProductValidation.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
      allowUnknown: true,
    });
    if (error) {
      return next(new AppError(error.message, 400));
    }

    let productObject = {
      name: removeEmptySpaces(req.body.name),
      description: removeEmptySpaces(req.body.description),
      category: req.body.category,
      subCategory: req.body.subCategory,
      seller: req.body.seller,
      productClass: req.body.productClass,
      hasColors: req.body.hasColors || false,
      hasMeasurements: req.body.hasMeasurements || false,
      price: req.body.price,
      quantityParameter: removeEmptySpaces(req.body.quantityParameter),
      discountPercentage: req.body.discountPercentage,
      stockQuantity: req.body.stockQuantity,
      brand: req.body.brand,
      productImages: req.body.productImages,
      ...(req.body.seller_commission && {
        seller_commission: req.body.seller_commission,
      }),
      ...(req.body.currency && {
        currency: removeEmptySpaces(req.body.currency),
      }),
      ...(req.body.absorbCustomerCharge && {
        absorbCustomerCharge: true,
      }),
      colorMeasurementVariations: req.body.colorMeasurementVariations,
    };

    const seller = await User.findOne({
      _id: req.body.seller,
      verified: true,
      active: true,
      role: 'seller',
    });

    if (!seller) {
      return next(new AppError('There is no seller that matches the provided seller Id.', 404));
    }

    // Forbid seller from creating products for other sellers
    if (req.body.seller !== req.user._id.toHexString() && req.user.role !== 'admin') {
      return next(new AppError('You are not allowed to create products for other sellers', 403));
    }

    // Check if product exists in the database
    const existingProduct = await Product.find({
      name: req.body.name,
      seller: req.body.seller,
    });

    if (existingProduct.length !== 0) {
      return next(new AppError('Product already exists.', 400));
    }

    // Check for ProductClass, Category, subcategory, and Brand
    const productClass = await ProductClass.findById(req.body.productClass);

    const category = await Category.findOne({
      _id: req.body.category,
      productClass,
    });

    const subCategory = await SubCategory.findOne({
      _id: req.body.subCategory,
      category: category?._id || req.body.category,
    });

    const brand = await Brand.findOne({
      _id: req.body.brand,
      productClass,
    });

    if (!category || (req.body.subCategory && !subCategory) || !productClass)
      return next(new AppError('ProductClass or category or subcategory not found', 400));

    // TODO: Seller Request for Brand
    if (req.body.brand && !brand) return next(new AppError('Brand does not exist.', 400));

    // Create the product
    const product = await Product.create(productObject);

    res.status(201).json({
      status: 'success',
      message: 'product created successfully',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};
