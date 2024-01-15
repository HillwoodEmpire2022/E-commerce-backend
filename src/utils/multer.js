import multer from "multer"

let storage = multer.memoryStorage()

export const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            const err = new Error('Only .png, .jpg and .jpeg formats for images are allowed!')
            err.name = 'ExtensionError'
            return cb(err);
        }
    },
})

let profilePictureStorage = multer.memoryStorage()

export const uploadProfilePicture = multer({
    storage: profilePictureStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            cb(null, true);
        } else {
            cb(null, false);
            const err = new Error('Only .png, .jpg and .jpeg formats for images are allowed!');
            err.name = 'ExtensionError';
            return cb(err);
        }
    },
}).single('profilePicture'); 
let businessLogoStorage = multer.memoryStorage()

export const uploadBusinessLogo = multer({
    storage:businessLogoStorage,
    fileFilter:(req, file, cb) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            cb(null, true);
        } else {
            cb(null, false);
            const err = new Error('Only .png, .jpg and .jpeg formats for images are allowed!');
            err.name = 'ExtensionError';
            return cb(err);
        }
    }
}).single('logo');
