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

    // Categorization
    productClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductClass',
      required: true,
    },

    // Should belong to ProductClass
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
    },

    // Should Belong in Product Class
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    },

    description: {
      type: String,
      trim: true,
      required: true,
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

ProductSchema.index(
  { name: 1, seller: 1 },
  { unique: true }
);

const Product = mongoose.model('Product', ProductSchema);
export default Product;
