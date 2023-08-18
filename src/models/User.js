import mongoose from "mongoose";

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
    password: {
        type: String,
        required: true,
        min: 6,
    },
    role: {
        type: String,
        required: true,
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
        type: String,
    },
    shippingAddress: {
        type: String,
    }
}, { timestamps: true }
)

const User = mongoose.model("User", UserSchema)
export default User