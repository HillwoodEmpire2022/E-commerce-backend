import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        min: 2,
        max: 255,
    },
    lastname: {
        type: String,
        required: true,
        min: 2,
        max: 255,
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
    },
    phoneNumber: {
        type: String,
        min: 10,
    },
    hashedPassword: {
        type: String,
        required: true,
        min: 6,
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
    },
    gender: {
        type: String,
    },
    billingAddress: {
        country: {
            type: String,
        },
        city: {
            type: String,
        },
        streetAddress: {
            type: String,
        } 
    },
    shippingAddress: {
        country: {
            type: String,
        },
        city: {
            type: String,
        },
        streetAddress: {
            type: String,
        } 
    }
}, { timestamps: true }
)

UserSchema.plugin(mongooseUniqueValidator,
    { message: 'Error, a user with {PATH}:{VALUE} already exists.' })
const User = mongoose.model("User", UserSchema)
export default User