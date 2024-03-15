import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true,
    },
    description: {
      type: String,
      trim: true,
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

    currency: {
      type: String,
      default: 'RWF',
    },

    discountPercentage: {
      type: Number,
    },

    hasColors: {
      type: Boolean,
    },

    hasMeasurements: {
      type: Boolean,
    },

    quantityParameter: {
      type: String,
    },

    brandName: {
      type: String,
      lowercase: true,
    },

    colorMeasurementVariations: {
      measurementType: {
        type: String,
        enum: ['size'],
      },

      variations: [
        {
          measurementvalue: String,

          colorImg: {
            public_id: {
              type: String,
            },
            url: {
              type: String,
            },
            colorName: String,
          },

          colorMeasurementVariationQuantity: Number,
        },
      ],
    },

    productImages: {
      productThumbnail: {
        url: {
          type: String,
          required: true,
        },
      },
      otherImages: [
        {
          url: {
            type: String,
          },
        },
      ],
    },
  },
  {
    // Removes _id add id
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
      },
    },
    timestamps: true,
    versionKey: false,
  }
);

ProductSchema.index({ name: 1, seller: 1 }, { unique: true });

const Product = mongoose.model('Product', ProductSchema);
export default Product;
