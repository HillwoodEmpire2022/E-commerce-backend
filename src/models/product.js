import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
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
    quantityParameter: {
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
        productThumbnail: {
            public_id: {
                type: String,
            },
            url: {
                type: String,
                required: true,
            },
            
        },
        otherImages: [
            {
                public_id: {
                    type: String,
                },
                url: {
                    type: String,
                    required: true,
                }
            }
        ],
        colorImages: [
            {
                public_id: {
                    type: String,
                },
                url: {
                    type: String,
                },
                colorName: {
                    type: String,
                }
            }
        ]
        
    },
    availableSizes: [
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

