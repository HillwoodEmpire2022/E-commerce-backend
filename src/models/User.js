import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        min: 2,
        max: 255,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        min: 2,
        max: 255,
        trim: true,
    },
    username: {
        type: String,
        min: 2,
        max: 255,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        message: "Custom A user with {PATH}:{VALUE} already exists."
    },
    phoneNumber: {
        type: String,
        default: null,
        trim: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "user",
    },
    profileImageUrl: {
        type: String,
        default: `https://res.cloudinary.com/hervebu
            /image/upload/v1692276423/hill_ecommerce/
            user_default_img_wrxrou.png`
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    gender: {
        type: String,
        default: null
    },
    billingAddress: {
        country: {
            type: String,
            default: null
        },
        city: {
            type: String,
            default: null
        },
        streetAddress: {
            type: String,
            default: null
        } 
    },
    shippingAddress: {
        country: {
            type: String,
            default: null
        },
        city: {
            type: String,
            default: null
        },
        streetAddress: {
            type: String,
            default: null
        } 
    }
}, { timestamps: true }
)

UserSchema.plugin(mongooseUniqueValidator, 

    { message :'Error, a user with {PATH}:{VALUE} already exists.' }
 )
const User = mongoose.model("User", UserSchema)
export default User
