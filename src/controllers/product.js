import Product from '../models/product.js';
import User from '../models/user.js';
import { base64FileStringGenerator } from '../utils/base64Converter.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { MongoIDValidator } from '../validations/mongoidValidator.js';
import {
  updateProductsValidation,
  uploadProductValidation,
} from '../validations/productValidation.js';
import Category from '../models/category.js';
import SubCategory from '../models/subcategory.js';
import removeEmptySpaces from '../utils/removeEmptySpaces.js';

// export const createProduct = async (req, res) => {
//   console.log(JSON.parse(req.body.measurements[0]));
//   try {
//     const { error } = uploadProductValidation.validate(req.body, {
//       errors: { label: 'key', wrap: { label: false } },
//       allowUnknown: true,
//     });

//     if (error) {
//       res.status(422).send({ message: error.message });
//       return;
//     }

//     const seller = await User.findById(req.body.seller);

//     if (!seller) {
//       return res.status(400).send({
//         message: 'There is no seller that matches the provided seller Id.',
//       });
//     }

//     const existingProduct = await Product.find({
//       name: req.body.name,
//       seller: req.body.seller,
//     });

//     if (existingProduct.length !== 0) {
//       return res
//         .status(409)
//         .send({ message: 'You have already uploaded this product.' });
//     }

//     let productThumbnailString = base64FileStringGenerator(
//       req.files.productThumbnail[0]
//     ).content;

//     if (!productThumbnailString) {
//       return res
//         .status(400)
//         .send({ message: 'There is no thumbnail image attached.' });
//     }

//     const uploadedThumbnail = await uploadToCloudinary(
//       productThumbnailString,
//       seller.companyName,
//       req.body.name,
//       'productThumbnail'
//     );

//     let otherImages = req.files.otherImages;

//     if (!otherImages || otherImages.length === 0) {
//       return res
//         .status(400)
//         .send({ message: 'There is no any image for otherImages' });
//     }

//     let uploadedOtherImages = [];
//     for (let i = 0; i < otherImages.length; i++) {
//       let imageString = base64FileStringGenerator(otherImages[i]).content;
//       let uploadedImage = await uploadToCloudinary(
//         imageString,
//         seller.companyName,
//         req.body.name,
//         'otherImages'
//       );
//       uploadedOtherImages[i] = {
//         public_id: uploadedImage.public_id,
//         url: uploadedImage.url,
//       };
//     }

//     let colorImages = req.files.colorImages;

//     if (!colorImages || colorImages.length === 0) {
//       return res
//         .status(400)
//         .send({ message: 'There is no any image for colorImages' });
//     }

//     let uploadedColorImages = [];
//     for (let i = 0; i < colorImages.length; i++) {
//       let imageString = base64FileStringGenerator(colorImages[i]).content;
//       let uploadedImage = await uploadToCloudinary(
//         imageString,
//         seller.companyName,
//         req.body.name,
//         'colorImages'
//       );
//       uploadedColorImages[i] = {
//         public_id: uploadedImage.public_id,
//         url: uploadedImage.url,
//         colorName: req.body.colorNames[i],
//       };
//     }

// let productObject = new Product({
//   name: req.body.name,
//   description: req.body.description,
//   category: req.body.category,
//   subcategory: req.body.subcategory,
//   seller: req.body.seller,
//   price: req.body.price,
//   discountPercentage: req.body.discountPercentage,
//   stockQuantity: req.body.stockQuantity,
//   quantityParameter: req.body.quantityParameter,
//   brandName: req.body.brandName,
//   availableSizes: req.body.availableSizes,
//   productImages: {
//     productThumbnail: uploadedThumbnail,
//     otherImages: uploadedOtherImages,
//     colorImages: uploadedColorImages,
//   },
// });

//     const product = await productObject.save();
//     res.status(201).json({
//       status: 'success',
//       data: {
//         product,
//       },
//     });

//     res.send('Done');
//   } catch (error) {
//     res.status(500).send({ message: error.message });
//   }
// };

export const getAllProducts = async (req, res) => {
  try {
    const queryObj = {};
    if (req?.user?.role === 'seller') queryObj.seller = req.user._id;
    const products = await Product.find(queryObj)
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

    if (products.length === 0) {
      return res
        .status(404)
        .send({ message: 'There are no products available.' });
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
    const { error } = MongoIDValidator.validate(req.params, {
      errors: { label: 'key', wrap: { label: false } },
    });

    if (error) {
      return res.status(400).json({ status: 'fail', message: error.message });
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
        .json({ status: 'fail', message: 'Product not found.' });
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
        .send({ message: 'No products belonging in this category.' });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const getProductsBySubCategory = async (req, res) => {
  try {
    const products = await Product.find({
      subcategory: req.params.subcategoryId,
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

    // find product by id
    const product = await Product.findById({ _id: productId });

    // check if the product exists
    if (!product) {
      return res.status(404).json({
        message: 'product not found',
      });
    }
    // check if the user is admin and the product is the owner of product
    if (
      product.seller.toString() !== req.user._id.toString() &&
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
    return res.status(500).json({ message: 'failed to delete product' });
  }
};
export const updateProductData = async (req, res) => {
  try {
    const { error } = updateProductsValidation.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
      allowUnknown: true,
    });

    if (error) {
      return res.status(422).json({ status: 'fail', message: error.message });
    }
    const isUserAdmin = req.user.role === 'admin';

    // If Update include seller, require admin to perform operation
    if (req.body.seller && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Acces denied! You are not allowed to perform this operation.',
      });
    }

    const product = await Product.findById(req.params.productId);

    if (!product)
      return res
        .status(404)
        .json({ status: 'fail', message: 'Product not found.' });

    // Check if product belongs to the user, if user updating the product is not an admin
    if (!isUserAdmin && product.seller.toHexString() !== req.user.id)
      return res
        .status(404)
        .json({ status: 'fail', message: 'Product not found.' });

    await Product.findByIdAndUpdate(req.params.productId, req.body);

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
      { name: { $regex: '^' + searchItem + '$', $options: 'i' } },
    ];

    if (searchItem) {
      const category = await Category.findOne({
        name: { $regex: '^' + searchItem + '$', $options: 'i' },
      });

      const subcategory = await SubCategory.findOne({
        name: { $regex: '^' + searchItem + '$', $options: 'i' },
      });

      if (category) {
        searchConditions.push({ category: category._id });
      }

      if (subcategory) {
        searchConditions.push({ subcategory: subcategory._id });
      }
    }

    if (!isNaN(searchItem)) {
      searchConditions.push({ price: parseFloat(searchItem) });
    }

    const products = await Product.find({ $or: searchConditions })
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
    price: req.body.price,
    discountPercentage: req.body.discountPercentage,
    stockQuantity: req.body.stockQuantity,
    brandName: removeEmptySpaces(req.body.brandName),
    productImages: req.body.productImages,
    ...(req.body.currency && {
      currency: removeEmptySpaces(req.body.currency),
    }),
    colorMeasurementVariations: req.body.colorMeasurementVariations,
  };

  try {
    const { error } = uploadProductValidation.validate(productObject, {
      errors: { label: 'key', wrap: { label: false } },
      allowUnknown: true,
    });
    if (error) {
      return res.status(422).send({ message: error.message });
    }

    const seller = await User.findById(req.body.seller);

    if (!seller) {
      return res.status(400).send({
        message: 'There is no seller that matches the provided seller Id.',
      });
    }

    // Check if product exists in the database
    const existingProduct = await Product.find({
      name: req.body.name,
      seller: req.body.seller,
    });

    if (existingProduct.length !== 0) {
      return res.status(400).send({ message: 'Product already exists.' });
    }

    // // Create the product
    await Product.create(productObject);

    res.status(201).json({
      status: 'success',
      message: 'product created successfully',
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: 'arror',
      message: 'Something unexpected has happend. Please try again later!',
    });
  }
};
