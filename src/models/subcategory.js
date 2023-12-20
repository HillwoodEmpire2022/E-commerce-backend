import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
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

const SubCategory = mongoose.model("SubCategory", SubCategorySchema);
export default SubCategory;
