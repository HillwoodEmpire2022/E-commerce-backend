import mongoose from "mongoose"

const SellerSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    companyName: {
        type: String,
    },
    businessAddress: {
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
}, { timestamps: true })

const Seller = mongoose.model("Seller", SellerSchema)
export default Seller