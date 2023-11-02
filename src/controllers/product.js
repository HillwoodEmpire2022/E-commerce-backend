import Product from "../models/product.js";
import Seller from "../models/seller.js";
import { base64FileStringGenerator } from "../utils/base64Converter.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { uploadProductValidation } from "../validations/productValidation.js";


export const uploadNewProduct = async (req, res) => { 
  try {
    const { error } = uploadProductValidation.validate(req.body, {
      errors: { label: "key", wrap: { label: false } },
      allowUnknown: true
    });
    if (error) {
      res.status(422).send({ message: error.message });
      return;
    }
    const seller = await Seller.findOne({ _id: req.body.seller })
    if (!seller) { 
      return res.status(400).send({message: "There is no seller that matches the provided seller Id."})
    } 

    const existingProduct = await Product.find({
      name: req.body.name,
      seller: req.body.seller
    })

    if (existingProduct.length !== 0) { 
      return res.status(409).send({ message: "You have already uploaded this same product."})
    }


    let productThumbnailString = base64FileStringGenerator(req.files.productThumbnail[0]).content;
    if (!productThumbnailString) { 
      return res.status(400).send({message: "There is no thumbnail image attached."})
    }
    const uploadedThumbnail = await uploadToCloudinary(productThumbnailString, seller.companyName, req.body.name, "productThumbnail")

    let otherImages = req.files.otherImages;

    if (!otherImages || otherImages.length === 0) { 
      return res.status(400).send({message: "There is no any image for otherImages"})
    }

    let uploadedOtherImages = []
    for (let i = 0; i < otherImages.length; i++) {
      let imageString = base64FileStringGenerator(otherImages[i]).content;
      let uploadedImage = await uploadToCloudinary(imageString, seller.companyName, req.body.name, "otherImages")
      uploadedOtherImages[i] = { public_id: uploadedImage.public_id, url: uploadedImage.url }
    }
  
    let colorImages = req.files.colorImages;

    if (!colorImages || colorImages.length === 0) { 
      return res.status(400).send({message: "There is no any image for colorImages"})
    }
    
    let uploadedColorImages = []
    for (let i = 0; i < colorImages.length; i++) {
      let imageString = base64FileStringGenerator(colorImages[i]).content;
      let uploadedImage = await uploadToCloudinary(imageString, seller.companyName, req.body.name, "colorImages")
      uploadedColorImages[i] = { public_id: uploadedImage.public_id, url: uploadedImage.url, colorName: req.body.colorNames[i] }
    }
  
    let discountedPrice = req.body.price - (req.body.discountPercentage/100)*req.body.price
    let productObject = new Product({
      ...req.body,
      discountedPrice: discountedPrice,
      productImages: {
        productThumbnail: uploadedThumbnail,
        otherImages: uploadedOtherImages,
        colorImages: uploadedColorImages,
      }
    })
  
    const savedProduct = await productObject.save()
    res.status(201).json(savedProduct)
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
}

export const getAllProducts = async (req, res) => { 
  try {
    const allProducts = await Product.find()
      .populate("category", "name")
      .populate("subcategory", "name").exec()
    
    if (allProducts.length === 0) {
      return res.status(404).send({ message: "There are no products available." })
    }
    res.status(200).json(allProducts)

  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.productId })
      .populate("seller", "companyName")
      .exec()
    
    if (!product) { 
      return res.status(404).send({ message: "Product not found."})
    }
    res.status(200).json(product)
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

export const getProductsByCategory = async (req, res) => { 
  try {
    const products = await Product.find({ category: req.params.categoryId })
    
    if (products.length === 0 ) { 
      return res.status(404).send({ message: "No products belonging in this category."})
    }
    res.status(200).json(products)
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

export const getProductsBySubCategory = async (req, res) => { 
  try {
    const products = await Product.find({ subcategory: req.params.subcategoryId })
    
    if (products.length === 0 ) { 
      return res.status(404).send({ message: "No products belonging in this sub category."})
    }
    res.status(200).json(products)
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}
