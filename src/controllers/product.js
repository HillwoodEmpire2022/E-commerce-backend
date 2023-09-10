import Product from "../models/product.js";
import Seller from "../models/seller.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { uploadProductValidation } from "../validations/productValidation.js";


export const uploadNewProduct = async (req, res) => { 
  try {
    const { error } = uploadProductValidation.validate(req.body, {
      errors: { label: "key", wrap: { label: false } },
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
      description: req.body.description,
      seller: req.body.seller
    })

    if (existingProduct.length !== 0) { 
      return res.status(409).send({ message: "You have already uploaded this same product."})
    }

    let productThumbnail = req.file;
    
    if (!productThumbnail) { 
      return res.status(400).send({message: "There is no thumbnail image attached."})
    }
    const uploadedThumbnail = uploadToCloudinary(productThumbnail.path, seller.companyName, req.body.name, "productThumbnail")
  
    let otherImages = req.files.otherImages;
    console.log(otherImages);
    if (!otherImages || otherImages.length === 0) { 
      return res.status(400).send({message: "There is no any image for otherImages"})
    }
    const uploadedOtherImages = otherImages.map(image => { 
      let uploadedImage = uploadToCloudinary(image.path, seller.companyName, req.body.name, "otherImages")
      return { public_id: uploadedImage.public_id, url: uploadedImage.url }
    })
  
    let colorImages = req.files.colorImages;
    console.log(colorImages);
    if (!colorImages || colorImages.length === 0) { 
      return res.status(400).send({message: "There is no any image for colorImages"})
    }
    
    let uploadedColorImages = []
    for (let i = 0; i < colorImages.length; i++) {
      let uploadedImage = await uploadToCloudinary(colorImages[i].path, seller.companyName, req.body.name, "colorImages")
      uploadedColorImages[i] = { public_id: uploadedImage.public_id, url: uploadedImage.url, colorName: colorImages[i].colorName}
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
 
