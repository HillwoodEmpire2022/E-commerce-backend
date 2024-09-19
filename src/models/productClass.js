import mongoose from 'mongoose';

const productClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    icon: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

productClassSchema.virtual('categories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'productClass',
});

productClassSchema.virtual('brands', {
  ref: 'Brand',
  localField: '_id',
  foreignField: 'productClass',
});

const ProductClass = mongoose.model('ProductClass', productClassSchema);

export default ProductClass;
