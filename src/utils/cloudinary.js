import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});

export const uploadToCloudinary = async (localFilePath, sellerName, productName, imageCategoryFolder) => {


    let filePathOnCloudinary = `${sellerName}/${productName}/${imageCategoryFolder}/${localFilePath}`
    
    const result = await cloudinary.uploader.upload(localFilePath, {
        public_id: filePathOnCloudinary,
    })
    fs.unlinkSync(localFilePath)
    if (result) { 
        return {
            public_id: result.public_id,
            url: result.url,
        };
    } 

}
