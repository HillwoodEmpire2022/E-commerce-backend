import Product from '../models/product.js';
import User from '../models/user.js';
import APIFeatures from '../utils/APIFeatures.js';
import { MongoIDValidator } from '../validations/mongoidValidator.js';
import {
  updateProductsValidation,
  uploadProductValidation,
} from '../validations/productValidation.js';
import Category from '../models/category.js';
import SubCategory from '../models/subcategory.js';
import removeEmptySpaces from '../utils/removeEmptySpaces.js';

export const getAllProducts = async (req, res) => {
  try {
    const queryObj = {};
    if (req?.user?.role === 'seller')
      queryObj.seller = req.user._id;

    // EXECUTE QUERY
    let features = new APIFeatures(
      Product.find(queryObj),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const products = await features.query
      .populate({
        path: 'category',
        select: 'name',
      })
      .populate({
        path: 'subcategory',
        select: 'name',
      });

    if (products.length === 0) {
      return res
        .status(404)
        .send({
          message: 'There are no products available.',
        });
    }
    res.status(200).json({
      status: 'success',
      count: products.length,
      data: {
        products,
      },
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    // 1) Validate user data
    const { error } = MongoIDValidator.validate(
      req.params,
      {
        errors: { label: 'key', wrap: { label: false } },
      }
    );

    if (error) {
      return res
        .status(400)
        .json({ status: 'fail', message: error.message });
    }
    const product = await Product.findOne({
      _id: req.params.productId,
    })
      .populate({
        path: 'seller',
        select: 'email',
        populate: {
          path: 'profile',
          select: 'locations companyName logo website',
          strictPopulate: false,
        },
      })
      .populate({
        path: 'category',
        select: 'name',
      })
      .populate({
        path: 'subcategory',
        select: 'name',
      })
      .exec();

    if (!product) {
      return res
        .status(404)
        .json({
          status: 'fail',
          message: 'Product not found.',
        });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.categoryId,
    });

    if (products.length === 0) {
      return res
        .status(404)
        .send({
          message:
            'No products belonging in this category.',
        });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const getProductsBySubCategory = async (
  req,
  res
) => {
  try {
    const products = await Product.find({
      subcategory: req.params.subcategoryId,
    });

    if (products.length === 0) {
      return res.status(404).send({
        message:
          'No products belonging in this sub category.',
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

    // find product by id
    const product = await Product.findById({
      _id: productId,
    });

    // check if the product exists
    if (!product) {
      return res.status(404).json({
        message: 'product not found',
      });
    }
    // check if the user is admin and the product is the owner of product
    if (
      product.seller.toString() !==
        req.user._id.toString() &&
      req.user.role != 'admin'
    ) {
      return res.status(403).json({
        message: ' You are not the owner of this product',
      });
    }
    // delete product if it is exist
    await Product.deleteOne({ _id: productId });
    return res.status(201).json({
      message: 'product deleted succesfully',
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'failed to delete product' });
  }
};
export const updateProductData = async (req, res) => {
  try {
    const { error } = updateProductsValidation.validate(
      req.body,
      {
        errors: { label: 'key', wrap: { label: false } },
        allowUnknown: true,
      }
    );

    if (error) {
      return res
        .status(422)
        .json({ status: 'fail', message: error.message });
    }
    const isUserAdmin = req.user.role === 'admin';

    // If Update include seller, require admin to perform operation
    if (req.body.seller && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message:
          'Acces denied! You are not allowed to perform this operation.',
      });
    }

    const product = await Product.findById(
      req.params.productId
    );

    if (!product)
      return res
        .status(404)
        .json({
          status: 'fail',
          message: 'Product not found.',
        });

    // Check if product belongs to the user, if user updating the product is not an admin
    if (
      !isUserAdmin &&
      product.seller.toHexString() !== req.user.id
    )
      return res
        .status(404)
        .json({
          status: 'fail',
          message: 'Product not found.',
        });

    await Product.findByIdAndUpdate(
      req.params.productId,
      req.body
    );

    res.status(200).json({
      status: 'success',
      data: {
        product: {
          id: product.id,
          name: product.name,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'fail',
      message: 'Unexpected error has occured!',
    });
  }
};

// user search product
export const searchProduct = async (req, res) => {
  try {
    const searchItem = req.body.searchItem;

    const searchConditions = [
      {
        name: {
          $regex: '^' + searchItem + '$',
          $options: 'i',
        },
      },
    ];

    if (searchItem) {
      const category = await Category.findOne({
        name: {
          $regex: '^' + searchItem + '$',
          $options: 'i',
        },
      });

      const subcategory = await SubCategory.findOne({
        name: {
          $regex: '^' + searchItem + '$',
          $options: 'i',
        },
      });

      if (category) {
        searchConditions.push({ category: category._id });
      }

      if (subcategory) {
        searchConditions.push({
          subcategory: subcategory._id,
        });
      }
    }

    if (!isNaN(searchItem)) {
      searchConditions.push({
        price: parseFloat(searchItem),
      });
    }

    const products = await Product.find({
      $or: searchConditions,
    })
      .populate({
        path: 'category',
        select: 'name',
      })
      .populate({
        path: 'subcategory',
        select: 'name',
      })
      .exec();

    if (products.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No items found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { products },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to search products',
    });
  }
};

export const createProduct = async (req, res) => {
  let productObject = {
    name: removeEmptySpaces(req.body.name),
    description: removeEmptySpaces(req.body.description),
    category: req.body.category,
    subcategory: req.body.subcategory,
    seller: req.body.seller,
    hasColors: req.body.hasColors || false,
    hasMeasurements: req.body.hasMeasurements || false,
    price: calculatePriceWithMarkup(req.body.price),
    quantityParameter: removeEmptySpaces(
      req.body.quantityParameter
    ),
    discountPercentage: req.body.discountPercentage,
    stockQuantity: req.body.stockQuantity,
    brandName: removeEmptySpaces(req.body.brandName),
    productImages: req.body.productImages,
    ...(req.body.currency && {
      currency: removeEmptySpaces(req.body.currency),
    }),
    colorMeasurementVariations:
      req.body.colorMeasurementVariations,
  };

  try {
    const { error } = uploadProductValidation.validate(
      productObject,
      {
        errors: { label: 'key', wrap: { label: false } },
        allowUnknown: true,
      }
    );
    if (error) {
      return res
        .status(422)
        .send({ message: error.message });
    }

    const seller = await User.findById(req.body.seller);

    if (!seller) {
      return res.status(400).send({
        message:
          'There is no seller that matches the provided seller Id.',
      });
    }

    // Check if product exists in the database
    const existingProduct = await Product.find({
      name: req.body.name,
      seller: req.body.seller,
    });

    if (existingProduct.length !== 0) {
      return res
        .status(400)
        .send({ message: 'Product already exists.' });
    }

    // Check for Category and subcategory
    const category = await Category.findById(
      req.body.category
    );
    const subCategory = await SubCategory.findById(
      req.body.subcategory
    );

    if (!category || !subCategory)
      return res.status(400).json({
        status: 'fail',
        message: 'category and or subcategory not found',
      });

    // If no brand, create it in subcategory
    if (
      !category.brands.includes(
        req.body.brandName.toLowerCase()
      )
    ) {
      category.brands = [
        ...category.brands,
        removeEmptySpaces(req.body.brandName),
      ];
      await category.save();
    }

    // // Create the product
    const product = await Product.create(productObject);

    res.status(201).json({
      status: 'success',
      message: 'product created successfully',
      data: {
        product,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: 'arror',
      message:
        'Something unexpected has happend. Please try again later!',
    });
  }
};

function calculatePriceWithMarkup(price) {
  const markupPercentage = 0.05; // 5% markup
  const markupAmount = price * markupPercentage;
  return price + markupAmount;
}
