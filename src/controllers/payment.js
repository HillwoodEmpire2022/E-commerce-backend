import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Order from '../models/order.js';
import PaypackJs from 'paypack-js';
import removeEmptySpaces from '../utils/removeEmptySpaces.js';
import Product from '../models/product.js';
import orderJoiSchema from '../validations/orderValidation.js';
import cashoutValidator from '../validations/cashoutValidation.js';
import { randomStringGenerator } from '../utils/randomStringGenerator.js';

import flw from '../services/flutterwave.js';

const paypack = new PaypackJs.default({
  client_id: process.env.PAYPACK_APP_ID,
  client_secret: process.env.PAYPACK_APP_SECRET,
});

async function updateOrderAndProducts(order) {
  // Payment was successfull
  // Update order status to pending
  order.status = removeEmptySpaces('pending');

  await order.save({
    validateBeforeSave: false,
  });

  // Update Ordered Products quantities
  const orderProducts = order.items;
  orderProducts.forEach(async (product) => {
    // Find the product
    const orderProduct = await Product.findById(
      product.product
    );

    const itemHasVariation =
      product.variation.color || product.variation.size;

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
                variation.colorImg.colorName ===
                  orderedCombination.color &&
                variation.measurementvalue ===
                  orderedCombination.size
              );

            // Only color
            if (
              orderedCombination.hasOwnProperty('color')
            ) {
              return (
                variation.colorImg.colorName ===
                orderedCombination.color
              );
            }

            // Only size
            if (orderedCombination.hasOwnProperty('size'))
              return (
                variation.measurementvalue ===
                orderedCombination.size
              );
          }
        );

      orderProduct.colorMeasurementVariations.variations[
        updatePosition
      ].colorMeasurementVariationQuantity -=
        product.quantity;

      // update product quantity
      orderProduct.stockQuantity -= product.quantity;
    }

    // Save the product
    await orderProduct.save();
  });
}

const findTransaction = async (ref) => {
  let {
    data: { transactions },
  } = await paypack.events({
    transaction_ref: ref,
  });

  let data = transactions.find(
    ({ data }) =>
      data.ref === ref && data.status === 'successful'
  );

  return data;
};

export const checkout = async (req, res, next) => {
  try {
    let checkout,
      order,
      timeOut = 0;

    const customerId = String(req.user._id);
    const orderData = {
      ...req.body,
      deliveryPreference: removeEmptySpaces(
        req.body.deliveryPreference
      ),
      customer: customerId,
    };

    const { error } = orderJoiSchema.validate(orderData, {
      errors: { label: 'key', wrap: { label: false } },
    });
    if (error) {
      console.log(error);
      return res
        .status(400)
        .json({ status: 'fail', message: error.message });
    }

    const session = await mongoose.startSession();

    // Requesting Payment and creating order
    await session.withTransaction(async () => {
      // Request for payment
      checkout = await paypack.cashin({
        number: req.body.paymentphoneNumber,
        amount: req.body.amount,
        environment: process.env.NODE_ENV,
      });

      orderData.tx_ref = checkout.data.ref;
      // Create Order
      order = await Order.create([orderData], { session });
    });

    await session.endSession();

    // Waiting for paymentrespose.data.id;
    let data = await findTransaction(checkout.data.ref);

    const intervalId = setInterval(() => {
      timeOut += 1000;
    }, 1000);

    while (!data) {
      if (timeOut === 20000) {
        clearInterval(intervalId);
        return res.status(400).json({
          status: 'fail',
          message: 'Payment not completed.',
          data: {
            orderId: order[0]._id,
          },
        });
      }
      data = await findTransaction(checkout.data.ref);
    }

    // Payment successfull
    res.status(200).json({
      status: 'sucess',
      data: {
        message: 'payment was successful',
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const cashout = async (req, res, next) => {
  try {
    const { error } = cashoutValidator.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
    });
    if (error) {
      return res
        .status(400)
        .json({ status: 'fail', message: error.message });
    }

    const response = await paypack.cashout({
      number: req.body.phoneNumber,
      amount: req.body.amount,
      environment: process.env.NODE_ENV,
    });

    // Payment successfull
    res.status(200).json({
      status: 'sucess',
      data: {
        message: 'Cashout was successful.',
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const webhook = async (req, res) => {
  //Extract X-Paypack-Signature headers from the request
  const requestHash = req.get('X-Paypack-Signature');

  //secret which you can find on your registered webhook
  const secret = process.env.WEBHOOK_SECRET_KEY;

  //Create a hash based on the parsed body
  const hash = crypto
    .createHmac('sha256', secret)
    .update(req.rawBody)
    .digest('base64');

  // Compare the created hash with the value of the X-Paypack-Signature headers
  if (!(hash === requestHash || req.Method != 'HEAD'))
    return res.send({});

  // Update Order Products
  // Find Order By Transaction Reference

  // Check if transaction was successfull
  if (req?.body?.data?.status !== 'successful')
    return res.send({});

  // Update Order and product qunatities

  const order = await Order.findOne({
    tx_ref: req.body.data.ref,
  });
  await updateOrderAndProducts(order);

  res.send({});
};

export const rw_mobile_money = async (req, res, next) => {
  try {
    const tx_ref = randomStringGenerator();
    let paymentLink, order;
    const session = await mongoose.startSession();

    // Create Order Data
    const customerId = String(req.user._id);
    const orderData = {
      ...req.body,
      tx_ref,
      payment_type: {
        type: 'mobile_money',
        details: req.body.shippingAddress.phoneNumber,
      },
      deliveryPreference: removeEmptySpaces(
        req.body.deliveryPreference
      ),
      customer: customerId,
    };

    // TODO Validate Order Data

    // First Create Order and initiate payment
    // Start Transaction
    await session.withTransaction(async () => {
      order = await Order.create([orderData], { session });

      // Create Payment Payload
      const payload = {
        tx_ref,
        order_id: order[0]._id.toHexString(),
        amount: req.body.amount,
        currency: 'RWF',
        email: req?.body?.email,
        phone_number: req.body.shippingAddress.phoneNumber,
        fullname: `${req.user.firstName} ${req.user.lastName}`,
      };

      // Initiate Payment
      paymentLink = await flw.MobileMoney.rwanda(payload);
    });

    // End Transaction
    await session.endSession();

    // Return Payment Link
    res.status(201).json({
      status: 'success',
      data: paymentLink,
    });
  } catch (error) {
    next(error);
  }
};
