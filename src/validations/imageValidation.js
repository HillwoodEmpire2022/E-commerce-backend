export const validateImage = (file) => { 
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"]
    return allowedImageTypes.includes(file.mimetype)
}

export const validateImagesArray = (imageArray) => { 
    for (let i = 0; i < imageArray.length; i++) { 
        const imageIsValid = validateImage(imageArray[i]);
        if (imageIsValid === false) { 
            return false
        }
    }
}
