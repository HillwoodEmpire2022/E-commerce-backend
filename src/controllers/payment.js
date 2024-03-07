import Flutterwave from 'flutterwave-node-v3';
// import got from 'got';
import axios from 'axios';
import mongoose from 'mongoose';
import Order from '../models/order.js';
import Product from '../models/product.js';

async function flutterwaveChackout(
  customerId,
  amount,
  tx_ref,
  currency,
  redirect_url,
  firstName,
  lastName,
  email
) {
  const response = await axios.post(
    process.env.FW_PAYMENT_URL,
    {
      tx_ref,
      amount,
      currency,
      redirect_url,
      meta: {
        customerId,
      },
      customer: {
        email,
        name: `${firstName} ${lastName}`,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    }
  );

  const paymentData = response.data;

  return paymentData;
}

export const checkout = async (req, res, next) => {
  const customerId = req.user._id;
  const tx_ref = Date.now() + customerId;
  const order = { ...req.body, customer: customerId, tx_ref };

  console.log(order, req.body.items);
  const { amount, currency } = order;
  const { email, firstName, lastName } = req.user;

  // A frontend URL
  const redirect_url = `${process.env.FN_URL}/payment-verification`;
  try {
    const session = await mongoose.startSession();
    let checkoutResponse;

    await session.withTransaction(async () => {
      // Create Order
      await Order.create([order], { session });
      // Checkout to flutterwave
      checkoutResponse = await flutterwaveChackout(
        customerId,
        amount,
        tx_ref,
        currency,
        redirect_url,
        firstName,
        lastName,
        email
      );
    });

    await session.endSession();

    res.status(200).json(checkoutResponse);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Verify Transaction, Create order, and update product quantities
export const verifyTransaction = async (req, res) => {
  const { tx_ref, transaction_id } = req.body;

  // Verify Transaction
  const respose = await verifyTrans(transaction_id);

  if (!tx_ref || !transaction_id)
    return res.status(500).json({
      status: 'error',
      message: 'There was an error processing payment! Please try again later.',
    });

  //   // Update Products Quantities
  if (respose.data.status !== 'successful')
    return res.status(500).json({
      status: 'error',
      message: 'There was an error processing payment! Please try again later.',
    });

  const order = await Order.findOne({
    tx_ref: tx_ref,
  });

  // TODO: STORE TRANSACTION

  order.status = 'pending';
  order.transId = respose.data.id;

  await order.save({
    validateBeforeSave: false,
  });

  // Update Order Products quantities
  const orderProducts = order.items;
  orderProducts.forEach(async (product) => {
    // Find the product
    const orderProduct = await Product.findById(product.product);

    const itemHasVariation = product.variation.color || product.variation.size;

    // If no colorMeasurementVariationQuantity, update product quantity
    if (!itemHasVariation) {
      orderProduct.stockQuantity -= product.quantity;
    }

    // If has variation, update quantity and colorMeasurementVariationQuantity
    if (itemHasVariation) {
      // {color:"red", size:12}, {color:"red"}, {size:""}
      const orderedCombination = product.variation;

      // Find position of combination to update
      const updatePosition =
        orderProduct.colorMeasurementVariations.variations.findIndex(
          (variation) => {
            // If combination is both (color and size)
            if (
              orderedCombination.hasOwnProperty('color') &&
              orderedCombination.hasOwnProperty('size')
            )
              return (
                variation.colorImg.colorName === orderedCombination.color &&
                variation.measurementvalue === orderedCombination.size
              );

            // Only color
            if (orderedCombination.hasOwnProperty('color')) {
              return variation.colorImg.colorName === orderedCombination.color;
            }

            // Only size
            if (orderedCombination.hasOwnProperty('size'))
              return variation.measurementvalue === orderedCombination.size;
          }
        );

      orderProduct.colorMeasurementVariations.variations[
        updatePosition
      ].colorMeasurementVariationQuantity -= product.quantity;

      // update product quantity
      orderProduct.stockQuantity -= product.quantity;
    }

    // Save the product
    await orderProduct.save();
  });

  res.status(200).json({
    status: 'success',
    message: 'Payment was successfull',
  });
};

async function verifyTrans(transactionId) {
  const flw = new Flutterwave(
    process.env.FLW_PUBLIC_KEY,
    process.env.FLW_SECRET_KEY
  );

  const response = await flw.Transaction.verify({
    id: `${transactionId}`,
  });

  return response;
}
