import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    productClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductClass',
      required: true,
    },
  },

  {
    // Removes _id add id
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

categorySchema.virtual('subCategories', {
  ref: 'SubCategory',
  localField: '_id',
  foreignField: 'category',
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
