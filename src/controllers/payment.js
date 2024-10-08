import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from '../models/order.js';
import Product from '../models/product.js';
import { randomStringGenerator } from '../utils/randomStringGenerator.js';
import removeEmptySpaces from '../utils/removeEmptySpaces.js';
import UAParser from 'ua-parser-js';
dotenv.config();

import User from '../models/user.js';
import flw from '../services/flutterwave.js';
import AppError from '../utils/AppError.js';
import sendEmail, { send_order_notification_email } from '../utils/email.js';
import { createdActivityLog, extractUserAgentdata } from '../utils/createActivityLog.js';

// Refactor create Activity log
async function createActivityLogs(order_id, req, doer, type, action, details, status) {
  const { ipAddress, browser, os } = extractUserAgentdata(req);

  const activity = {
    userId: doer?._id,
    activity: {
      type,
      action,
    },

    resource: {
      name: 'orders',
      id: order_id,
    },

    details,
    status,

    ipAddress,
    userAgent: {
      browser: `${browser.name} ${browser.version}`,
      os: ` ${os.name} ${os.version}`,
    },
  };

  await createdActivityLog(activity);
}

async function updateOrderProducts(orderProducts) {
  // Update Ordered Products quantities
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
      const updatePosition = orderProduct.colorMeasurementVariations.variations.findIndex((variation) => {
        // If combination is both (color and size)
        if (orderedCombination.hasOwnProperty('color') && orderedCombination.hasOwnProperty('size'))
          return (
            variation.colorImg.colorName === orderedCombination.color &&
            variation.measurementvalue === orderedCombination.size
          );

        // Only color
        if (orderedCombination.hasOwnProperty('color')) {
          return variation.colorImg.colorName === orderedCombination.color;
        }

        // Only size
        if (orderedCombination.hasOwnProperty('size')) return variation.measurementvalue === orderedCombination.size;
      });

      orderProduct.colorMeasurementVariations.variations[updatePosition].colorMeasurementVariationQuantity -=
        product.quantity;

      // update product quantity
      orderProduct.stockQuantity -= product.quantity;
    }

    // Save the product
    await orderProduct.save();
  });
}

async function verifyTransaction(transactionId) {
  try {
    const res = await flw.Transaction.verify({
      id: transactionId,
    });

    return res;
  } catch (error) {
    throw error;
  }
}

// Current Implementation
// FLW Comphensive Payment
export const pay = async (req, res, next) => {
  let response, order;
  const session = await mongoose.startSession();
  const tx_ref = randomStringGenerator();
  const customerId = req.user._id;

  const { amount, email, phoneNumber, shippingAddress, items, name, deliveryPreference } = req.body;
  const redirect_url = process.env.payment_redirect_url;

  // Body
  const payment_body = {
    tx_ref,
    amount,
    currency: 'RWF',
    redirect_url,
    customer: {
      email,
      name,
    },
    customizations: {
      title: 'Pay for items in cart',
    },
  };

  // Order Body
  const orderData = {
    items,
    amount,
    shippingAddress: {
      ...shippingAddress,
      phoneNumber,
      email,
    },
    tx_ref,
    deliveryPreference: removeEmptySpaces(deliveryPreference),
    customer: customerId,
  };

  try {
    // Requesting Payment and creating order
    await session.withTransaction(async () => {
      // Request Payment Link
      response = await axios.post(
        'https://api.flutterwave.com/v3/payments',
        {
          ...payment_body,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      // Create Order
      order = await Order.create([orderData], { session });
    });

    await session.endSession();

    res.status(200).json(response.data);
  } catch (err) {
    next(err);
  }
};

export const retryPay = async (req, res, next) => {
  try {
    const tx_ref = randomStringGenerator();
    const order = await Order.findOne({ _id: req.params.orderId, status: 'awaits payment' }).populate({
      path: 'customer',
      select: 'firstName lastName email',
    });

    if (!order) return next(new AppError('Order not found or is already payed', 404));

    order.tx_ref = tx_ref;
    await order.save({
      validateBeforeSave: false,
    });

    const redirect_url = process.env.payment_redirect_url;

    // Create payment payload
    const payment_body = {
      tx_ref,
      amount: order.amount,
      currency: 'RWF',
      redirect_url,
      customer: {
        email: order.customer.email,
        name: `${order.customer.firstName} ${order.customer.lastName}`,
      },
      customizations: {
        title: 'Pay for items in cart',
      },
    };

    // Request Payment Link
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        ...payment_body,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }
};

export const flw_webhook = async (req, res, next) => {
  // If you specified a secret hash, check for the signature
  const secretHash = process.env.FLW_WEBHOOK_SECRET;
  const signature = req.headers['verif-hash'];

  if (!signature || signature !== secretHash) {
    // This request isn't from Flutterwave; discard
    return res.status(401).end();
  }

  const payload = req.body;
  // Find Order
  const order = await Order.findOne({
    tx_ref: payload.data.tx_ref,
    status: 'awaits payment',
  })
    .populate({ path: 'items.product', select: 'name' })
    .populate({ path: 'customer', select: 'firstName lastName email' });

  // Update Order
  const paymentType = payload.data.payment_type;
  order.paymentDetails = {
    customer: {
      id: payload.data.customer.id,
      name: payload.data.customer.name,
      email: payload.data.customer.email,
    },

    payment_type: {
      type: payload.data.payment_type,
      ...(paymentType === 'card'
        ? {
            card: {
              first_6digits: payload.data.card.first_6digits,
              last_4digits: payload.data.card.last_4digits,
              issuer: payload.data.card.issuer,
              country: payload.data.card.country,
              type: payload.data.card.type,
              expiry: payload.data.card.expiry,
            },
          }
        : { mobile_number: payload.data.customer.phone_number }),
    },
  };

  order.status = 'pending';
  order.transactionId = payload.data.id;

  await order.save({
    validateBeforeSave: false,
  });

  if (!order) return res.status(404).end();
  // Verify Transaction
  const response = await verifyTransaction(payload.data.id);

  if (response?.message && response.message === 'No transaction was found for this id') {
    // Transaction Not found
    return res.status(404).end();
  }

  // If Payment was unsucessfull
  if (response && response.status !== 'successful' && response.data.status !== 'successful') {
    // TODO: Handle failed payment: Notify user and admin
    return res.status(404).end();
  }

  // Update Order
  await updateOrderProducts(order.items);

  // Send Email to Customer
  const order_url = `${process.env.CLIENT_URL}/user/order/${order._id}`;
  const customer = await User.findById(order.customer);

  // CUstomer Email Obtions
  const emailOptions = {
    to: order.customer.email,
    subject: `Feli Express - Your Order (#${order._id}) Has Been Received!`,
    firstName: customer.firstName,
    order_url,
  };

  // Admin Email Options
  const adminEmails = await User.find({ role: 'admin' }).select('email');

  const adminEmailOptions = {
    to: adminEmails.map((admin) => admin.email),
    subject: `New Order (#${order._id}) Has Been Received!`,
    orderId: order._id,
  };

  // Order Notification emails
  try {
    // Customer
    await send_order_notification_email(emailOptions, order);
    // Admin
    await sendEmail(adminEmailOptions, 'admin-order-notification');

    await createActivityLogs(
      order._id,
      req,
      order.customer,
      'user',
      'order_placed',
      'An order has been placed',
      'success'
    );
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }

  res.status(200).end();
};
