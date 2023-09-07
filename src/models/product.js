import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory"
    },
    price: {
        type: Number,
        required: true,
    },
    stockQuantity: {
        type: Number,
        required: true,
    },
    quantityLabel: {
        type: String,
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
    },
    discountPercentage: {
        type: Number, 
    },
    discountedPrice: {
        type: Number,
    },
    productImages: {
        imageThumbnail: {
            id: {
                type: String, 
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
            
        },
        otherImages: [
            {
                id: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                }
            }
        ],
        colorImages: [
            {
                id: {
                    type: String,
                },
                url: {
                    type: String,
                }
            }
        ]
        
    },
    sizes: [
        {
            type: String,
        }   
    ],
    brandName: {
        type: String,
    }

    


}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema)

export default Product

