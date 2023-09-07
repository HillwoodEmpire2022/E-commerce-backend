import Product from "../models/product";
import { validateImage } from "../validations/imageValidation";
import { uploadProductValidation } from "../validations/productValidation";


export const uploadNewProduct = async (req, res) => { 
    const { error } = uploadProductValidation.validate(req.body, {
        errors: { label: "key", wrap: { label: false } },
      });
    if (error) {
       res.status(422).send({ message: error.message });
       return;
    }

    const thumbnailImageIsValid = validateImage(req.imageThumbnail)
    if (thumbnailImageIsValid === false) { 
        return res.status(422).send({
            message: "Product thumbnail image should be type jpeg, jpg, png or gif."
        })
    }
    const otherImagesValid = validateImagesArray(req.otherImages)
    if (otherImagesValid === false) { 
        return res.status(422).send({
            message: "One of the otherImages is not of type jpeg, jpg, png or gif."
        })
    }

    const colorImagesValid = validateImagesArray(req.colorImages)
    if (colorImagesValid === false) { 
        return res.status(422).send({
            message: "One of the colorImages is not of type jpeg, jpg, png or gif."
        })
    }   

}
 
