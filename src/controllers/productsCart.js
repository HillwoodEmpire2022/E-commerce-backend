import Product from "../models/product.js";
import Cart from "../models/productsCart.js";
import User from "../models/user.js";
import { cartValidation } from "../validations/cartValidations.js";

export const addToCart = async (req, res) => { 
    try {
        const { product, colorId, size, deliveryFee, quantity } = req.body;
        const { error } = cartValidation.validate(req.body, {
            errors: { label: "key", wrap: { label: false } },
            allowUnknown: true
        })
        if (error) {
            return res.status(422).send({ message: error.message });
        }

        const DBUserInfo = await User.findOne({_id: req.userId})
        if (DBUserInfo === null) { 
            return res.status(401).send({ message: "User token has expired! Please login again." });
        }

        // Check for product in the database
        const DBProductInfo = await Product.findOne({ _id: product })
        if (DBProductInfo === null) {
            return res.status(400).send({ message: "The product you are trying to add to cart has been removed from the stock." });
        } 
        
        const newCartItem = new Cart({
            product: DBProductInfo._id, 
            colorId,
            size, 
            deliveryFee,
            quantity,
            user: DBUserInfo._id,
        })
        
        const savedCartItem = await newCartItem.save();
        if (savedCartItem) {
            return res.status(201).json(savedCartItem)
        }
        
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}



