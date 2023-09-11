import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

if (!fs.existsSync("./uploads")) { 
    fs.mkdirSync("./uploads")
}

export const uploadToCloudinary = async (localFilePath, sellerName, productName, imageCategoryFolder) => {
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET, 
    });

    let filePathOnCloudinary = `${sellerName}/${productName}/${imageCategoryFolder}/`
    
    const result = await cloudinary.uploader.upload(localFilePath, {
        folder: filePathOnCloudinary,
    })
    fs.unlinkSync(localFilePath)
    if (result) { 
        return {
            public_id: result.public_id,
            url: result.url,
        };
    } 

}
