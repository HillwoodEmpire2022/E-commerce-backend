import Product from "../models/product.js";
import Cart from "../models/productsCart.js";
import User from "../models/user.js";
import { addToCartValidation, updateCartValidation } from "../validations/cartValidations.js";

export const addToCart = async (req, res) => { 
    try {
        const { product, colorId, size, deliveryFee, quantity } = req.body;
        const { error } = addToCartValidation.validate(req.body, {
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
        
        const existingCartItem = await Cart.find({ _id: DBProductInfo, colorId, size, deliveryFee, user: DBUserInfo._id })
        let savedCartItem = {}
        if (existingCartItem.length > 0) {
            savedCartItem = await Cart.findOneAndUpdate({ _id: existingCartItem._id }, { $set: { quantity: quantity } }, {
                new: true,
            })
        } else if (existingCartItem.length === 0) { 
            const newCartItem = new Cart({
                product: DBProductInfo._id, 
                colorId,
                size, 
                deliveryFee,
                quantity,
                user: DBUserInfo._id,
            })
            savedCartItem = await newCartItem.save();
        } 
        if (savedCartItem) {
            return res.status(201).json(savedCartItem)
        }
        
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

export const getCartItems = async (req, res) => { 
    try {
        const DBUserInfo = await User.findOne({_id: req.userId})
        if (DBUserInfo === null) { 
            return res.status(401).send({ message: "User token has expired! Please login again." });
        }
        
        const allCartItems = await Cart.find({user: DBUserInfo._id})
            .populate("product")
            .lean()
            .exec()
        let formattedCartItems = allCartItems.map((cartItem) => { 
            let itemCost = 0;
            if (cartItem.product.discountedPrice > 0) {
                itemCost = (cartItem.product.discountedPrice * cartItem.quantity) + cartItem.deliveryFee;
            } else if (cartItem.product.discountedPrice === 0) { 
                itemCost = (cartItem.product.price * cartItem.quantity) + cartItem.deliveryFee;
            }

            let selectedProductImage = cartItem.product.productImages.productThumbnail.url;
            for (let i = 0; i < cartItem.product.productImages.colorImages.length; i++) { 
                if (cartItem.product.productImages.colorImages[i]._id === cartItem.colorId) { 
                    selectedProductImage = cartItem.product.productImages.colorImages[i].url;
                    break;
                }
            }
            const item = {
                ...cartItem,
                productTotalCost: itemCost,
                selectedProductImage,
                availableUnits: cartItem.product.stockQuantity,
                quantityParameter: cartItem.product.quantityParameter,
                
            }
            return item;
        })
        if (formattedCartItems.length > 0) {
            return res.status(200).json(formattedCartItems)
        } else { 
            return res.status(400).send({message: "There isn't any item in the cart. Explore items to add to cart."})
        }
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

export const deleteCartItem = async (req, res) => { 
    try {
        const DBUserInfo = await User.findOne({_id: req.userId})
        if (DBUserInfo === null) { 
            return res.status(401).send({ message: "User does not exist! Please signup or login again." });
        }
        const deletedCartItem = await Cart.findOneAndDelete({ _id: req.params.cartItemId })
        if (deletedCartItem) {
            return res.status(200).send({ message: "Cart item deleted successfully." })
        }
        
        const cartItems = await Cart.find({ user: req.userId })
        if (cartItems.length === 0) { 
            return res.status(404).send({ message: "Your cart is empty." })
        }
            
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

export const deleteAllCartItems = async (req, res) => { 
    try {
        const DBUserInfo = await User.findOne({_id: req.userId})
        if (DBUserInfo === null) { 
            return res.status(401).send({ message: "User does not exist! Please signup or login again." });
        }

        const deleteManyResponse = await Cart.deleteMany({ user: req.userId })
        console.log(deleteManyResponse);
        if (deleteManyResponse.deletedCount >= 0) {
            return res.status(200).send({ message: "All cart items deleted successfully." })
        } 

        const cartItems = await Cart.find({ user: req.userId })
        if (cartItems.length === 0) { 
            return res.status(404).send({ message: "Your cart is empty." })
        }
            
        
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

export const updateCartItem = async (req, res) => { 
    try {
        const { error } = updateCartValidation.validate(req.body, {
            errors: { label: "key", wrap: { label: false } },
            allowUnknown: true
        })
        if (error) {
            return res.status(422).send({ message: error.message });
        }
        const cartItemInfo = req.body
        const reqBodyKeys = Object.keys(cartItemInfo)
        const updates = {}
        reqBodyKeys.forEach((key, index) => {
            if (cartItemInfo[key]) { 
                updates[key] = cartItemInfo[key]
            }
        })

        const updatedCartItem = await Cart.findOneAndUpdate({ _id: req.params.cartItemId }, { $set: updates }, {
            new: true,
        })
        if (updatedCartItem) {
            return res.status(200).send({ message: "Cart item updated successfully." })
        } else { 
            return res.status(500).send({ message: "Unable to update cart item. The cart item may have been removed." })
        }
    } catch (error) {
        return res.status(500).send({ message: error.message })        
    }
}

