import { v2 as cloudinary } from 'cloudinary';

export const uploadToCloudinary = async (fileString, sellerName, productName, imageCategoryFolder) => {
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET, 
    });

    let filePathOnCloudinary = `${sellerName}/${productName}/${imageCategoryFolder}/`
    
    const result = await cloudinary.uploader.upload(fileString, {
        folder: filePathOnCloudinary,
    })
    if (result) { 
        return {
            public_id: result.public_id,
            url: result.url,
        };
    } 

}

export const uploadProfileImageToCloudinary = async (fileString, userName) => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  
    let filePathOnCloudinary = `profiles/${userName}/`;
  
    try {
      const result = await cloudinary.uploader.upload(fileString, {
        folder: filePathOnCloudinary,
      });
  
      if (result) {
        return {
          public_id: result.public_id,
          url: result.url,

        };
      }
    } catch (error) {
      console.error('Error uploading profile image to Cloudinary:', error);
      throw error; 
    }
  };


export const uploadbusinessLogoToCloudinary = async (fileString, businessLogo) => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  
    let filePathOnCloudinary = `logos/${businessLogo}/`;
  
    try {
      const result = await cloudinary.uploader.upload(fileString, {
        folder: filePathOnCloudinary,
      });
  
      if (result) {
        return {
          public_id: result.public_id,
          url: result.url,

        };
      }
    } catch (error) {
      console.error('Error uploading business logo to Cloudinary:', error);
      throw error; 
    }
  };
  
  