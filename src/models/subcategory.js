import mongoose from "mongoose"

const SubCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }
}, { timestamps: true })

const SubCategory = mongoose.model("SubCategory", SubCategorySchema)
export default SubCategory
