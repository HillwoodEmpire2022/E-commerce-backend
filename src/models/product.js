import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    sku: {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    brand: {
        type: String,
        
    }

}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema)

export default Product

