import mongoose from "mongoose"

const CartSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    colorId: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    deliveryFee: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;
