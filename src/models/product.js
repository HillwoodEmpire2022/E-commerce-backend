import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    description: {
      type: String,
    },
    stockQuantity: {
      type: Number,
    },
    stockLocation: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
    },
    // availableSizes ["xs", "sm", m, lg, xlg,xxlg]
    // availableSizes ["120px", "2000px"]
    // availableSizes ["8", "12", "14", "16"]
    availableSizes: [String],
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
          },
        },
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
          },
        },
      ],
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    versionKey: false,
    id: true,
    toJSON: {
      virtuals: true,
      //   transform: (doc, ret) => {
      //     ret.id = _id;
      //     return ret;
      //   },
    },
  }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
