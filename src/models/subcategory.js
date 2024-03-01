import mongoose from 'mongoose';

const SubCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
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

    versionKey: false,
    timestamps: true,
  }
);

SubCategorySchema.index({ name: 1, category: 1 }, { unique: true });

const SubCategory = mongoose.model('SubCategory', SubCategorySchema);
export default SubCategory;
