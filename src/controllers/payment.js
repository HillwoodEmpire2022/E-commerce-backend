import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import open from 'open';
import PaypackJs from 'paypack-js';
import Order from '../models/order.js';
import Product from '../models/product.js';
import { randomStringGenerator } from '../utils/randomStringGenerator.js';
import removeEmptySpaces from '../utils/removeEmptySpaces.js';
import cashoutValidator from '../validations/cashoutValidation.js';
import orderJoiSchema from '../validations/orderValidation.js';
dotenv.config();

import flw from '../services/flutterwave.js';
import AppError from '../utils/AppError.js';
const paypack = new PaypackJs.default({
  client_id: process.env.PAYPACK_APP_ID,
  client_secret: process.env.PAYPACK_APP_SECRET,
});

const generateRedirectUrl = () => {
  // Determine redirect url based on environment
  const nodeEnv = process.env.NODE_ENV;
  const clientDevUrl = process.env.CLIENT_DEV_URL;
  const clientStagingUrl = process.env.CLIENT_STAGING_URL;
  const clientProductionUrl = process.env.CLIENT_PRODUCTION_URL;
  const redirect_url =
    nodeEnv === 'development' ? clientDevUrl : nodeEnv === 'staging' ? clientStagingUrl : clientProductionUrl;

  return redirect_url;
};

async function updateOrderAndProducts(order, customerDetails, transactionId) {
  // Payment was successfull
  // Update order status to pending
  order.status = removeEmptySpaces('pending');
  order.customerDetails = customerDetails;
  order.transactionId = transactionId;

  await order.save({
    validateBeforeSave: false,
  });

  // Update Ordered Products quantities
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

const findTransaction = async (ref) => {
  let {
    data: { transactions },
  } = await paypack.events({
    transaction_ref: ref,
  });

  let data = transactions.find(({ data }) => data.ref === ref && data.status === 'successful');

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
      deliveryPreference: removeEmptySpaces(req.body.deliveryPreference),
      customer: customerId,
    };

    const { error } = orderJoiSchema.validate(orderData, {
      errors: { label: 'key', wrap: { label: false } },
    });
    if (error) {
      console.log(error);
      return res.status(400).json({ status: 'fail', message: error.message });
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
      return res.status(400).json({ status: 'fail', message: error.message });
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
  const hash = crypto.createHmac('sha256', secret).update(req.rawBody).digest('base64');

  // Compare the created hash with the value of the X-Paypack-Signature headers
  if (!(hash === requestHash || req.Method != 'HEAD')) return res.send({});

  // Update Order Products
  // Find Order By Transaction Reference

  // Check if transaction was successfull
  if (req?.body?.data?.status !== 'successful') return res.send({});

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
        mobile_number: req.body.phoneNumber,
      },
      deliveryPreference: removeEmptySpaces(req.body.deliveryPreference),
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
        email: req.body.email,
        phone_number: req.body.phoneNumber,
        fullname: `${req.user.firstName} ${req.user.lastName}`,
      };

      // Save Payload to Order in case of delayed payment so customer can pay later
      order[0].momo_payload = { ...payload, order_id: undefined };
      await order[0].save();

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

export const flw_webhook = async (req, res, next) => {
  // If you specified a secret hash, check for the signature
  const secretHash = process.env.FLW_ECRYPTION_KEY;
  const signature = req.headers['verif-hash'];

  if (!signature || signature !== secretHash) {
    // This request isn't from Flutterwave; discard
    res.status(401).end();
  }

  const payload = req.body;
  console.log('Flutterwave Event: 🚀🚀 ', payload?.['event.type']);

  // Find Order
  const order = await Order.findOne({
    tx_ref: payload.data.tx_ref,
  });

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
  await updateOrderAndProducts(order, response.data.customer, response.data.id);

  res.status(200).end();
};

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

// For 3DS no problem
// For PIN transactions
// Create a route that receives pin and proceed withpayment
export const flw_card = async (req, res, next) => {
  // Initiating the transaction
  const tx_ref = randomStringGenerator();
  const customerId = req.user._id;

  // Determine redirect url based on environment
  const redirect_url = generateRedirectUrl();

  // Payment Payload
  const payload = {
    ...req.body.payment_payload,
    enckey: process.env.FLW_ECRYPTION_KEY,
    redirect_url,
    tx_ref: tx_ref,
  };

  try {
    const response = await flw.Charge.card(payload);

    // Authorizing transactions
    // // For PIN and AVS Authorization modes
    if (response?.meta?.authorization.mode === 'pin' || response?.meta?.authorization.mode === 'avs_noauth') {
      // Create Order
      const orderData = {
        ...req.body,
        payload: undefined,
        payment_type: {
          type: 'card',
        },
        tx_ref,
        deliveryPreference: removeEmptySpaces(req.body.deliveryPreference),
        customer: customerId,
      };

      // Create order
      await Order.create(orderData);

      // Respond with payload that will be sent to /authorize with pin
      return res.status(200).json({
        status: 'success',
        message: response.message,
        data: {
          authorization: {
            mode: response?.meta?.authorization.mode,
            fields: response?.meta?.authorization.fields,
          },
          payment_payload: {
            ...payload,
            enckey: undefined,
          },
        },
      });
    }

    // For 3DS or VBV transactions, redirect users to their issue to authorize the transaction
    if (response?.meta?.authorization.mode === 'redirect') {
      //  Order Data
      const orderData = {
        ...req.body,
        payload: undefined,
        payment_type: {
          type: 'card',
          card: JSON.parse(JSON.stringify(response.data.card)),
        },
        tx_ref,
        deliveryPreference: removeEmptySpaces(req.body.deliveryPreference),
        customer: customerId,
        transactionId: response.data.id,
      };

      // Create order
      await Order.create(orderData);

      // Extract the redirect url
      const url = response.meta.authorization.redirect;

      // Redirect User to the authorization page to enter OTP
      open(url);

      return res.status(302).json({
        status: 'success',
        message: 'Redirecting to authorize transaction',
      });
    }

    // Card payment intialization errors
    if (response?.status === 'error') {
      return next(new AppError(response.message, 400));
    }

    return next(new AppError('An error occured. Please try again', 500));
  } catch (error) {
    next(error);
  }
};

// For PIN and AVS transactions: Authorize
export const authorizeFlwOtpAndAvsTransaction = async (req, res, next) => {
  try {
    const authorizationPayload = {
      ...req.body.payment_payload,
      enckey: process.env.FLW_ECRYPTION_KEY,
    };

    // Auth Mode
    const authMode = req.body.auth_mode;

    // Create new Payload
    // Country Must be 2Characters
    authorizationPayload.authorization = {
      mode: authMode,
      ...(authMode === 'pin' ? { pin: req.body.pin } : { ...req.body.address }),
    };

    const charge = await flw.Charge.card(authorizationPayload);

    // Charge message == 'Charge authorization data required'
    if (charge.message === 'Charge authorization data required') {
      return res.status(400).json({
        status: 'fail',
        message: 'Charge authorization is required.',
        data: {
          authorization: {
            mode: charge?.meta?.authorization.mode,
            fields: charge?.meta?.authorization.fields,
          },
          // TODO STORE IT IN A SESSION OR REDIS
          payment_payload: {
            ...authorizationPayload,
            authorization: undefined,
            enckey: undefined,
          },
        },
      });
    }

    // Authorization Error
    if (charge.status === 'error') {
      return next(new AppError(charge.message, 400));
    }

    // Update order with PAYMENT_TYPE Card
    const order = await Order.findOne({
      tx_ref: charge?.data?.tx_ref,
    });

    // Update Order
    order.payment_type = {
      type: 'card',
      card: JSON.parse(JSON.stringify(charge.data.card)),
    };

    await order.save({
      validateBeforeSave: false,
    });

    // Return FLW_REF to send it together with OTP to /validate
    return res.status(200).json({
      status: 'success',
      message: 'Provide OTP to validate transaction',
      data: {
        flw_ref: charge.data.flw_ref,
        validateUrl: 'api/v1/payments/validate-card',
      },
    });
  } catch (error) {
    return next(error);
  }
};

// For PIN and AVS Validate with OTP
export const validateFlwOtpTransaction = async (req, res, next) => {
  try {
    const response = await flw.Charge.validate({
      otp: req.body.otp,
      flw_ref: req.body.flw_ref,
    });

    if (response.status === 'error') {
      return next(new AppError(response.message, 400));
    }

    res.status(200).json({
      status: 'success',
      message: 'Your order is successful payed.',
    });
  } catch (error) {
    // FLutterwave Validation error
    if (error.name === 'validationError') {
      return next(new AppError(error.message, 400));
    }

    return next(error);
  }
};

// For Momo delayed payments
export const retry_momo_payment = async (req, res, next) => {
  // Find Order
  const order = await Order.findOne({ _id: req.body.momo_payload.order_id, customer: req.user._id });

  if (!order) return next(new AppError('Order not found', 404));

  // Check if it has been payed: Does it have transactionId? Verify the transaction
  if (!order.transactionId || order.status === 'awaits payment') {
    // Initiate Payment
    const response = await flw.MobileMoney.rwanda(req.body.momo_payload);

    // Redirect User to the authorization page to enter OTP
    open(response.meta.authorization.redirect);

    return res.status(200).json({
      status: 'success',
      message: 'Redirecting to otp page',
      data: {
        redirect: response.meta.authorization.redirect,
      },
    });
  }

  // If there is a transactionId, verify it
  if (order.transactionId) {
    const response = await verifyTransaction(order.transactionId);
    if (response.data.status === 'successful')
      return res.status(200).json({ status: 'success', message: 'Order has already been payed.' });
  }

  return res.status(400).json({
    status: 'fail',
    message: 'Order has already been payed.',
  });
};

export const retry_card_payment = async (req, res, next) => {
  try {
    let verify;
    // A user should be able to pay an order that was not payed
    // Find Order
    const order = await Order.findOne({ _id: req.body.order_id, customer: req.user._id });

    if (!order) return next(new AppError('Order not found', 404));

    if (order.transactionId) verify = await verifyTransaction(order.transactionId);

    if (verify && verify?.data?.status !== 'pending') {
      return res.status(400).json({
        status: 'fail',
        message: 'Order has already been payed.',
      });
    }

    if (order.status !== 'awaits payment') {
      // Check if it has been payed by its transactionId or status
      return res.status(400).json({
        status: 'fail',
        message: 'Order has already been payed.',
      });
    }

    // If not paid Construct Card Payload
    const tx_ref = randomStringGenerator();
    const redirect_url = generateRedirectUrl();
    const payload = {
      ...req.body.payload,
      enckey: process.env.FLW_ECRYPTION_KEY,
      redirect_url,
      tx_ref: tx_ref,
    };

    // Initialize Payment
    const response = await flw.Charge.card(payload);

    // Card payment intialization errors
    if (response?.status === 'error') {
      return next(new AppError(response.message, 400));
    }

    // Determine the authorization method
    // If it is PIN, return the payload to the user to enter the pin
    // If it is AVS, return the payload to the user to enter the address
    if (response?.meta?.authorization.mode === 'pin' || response?.meta?.authorization.mode === 'avs_noauth') {
      // Respond with payload that will be sent to /authorize with pin
      return res.status(200).json({
        status: 'success',
        message: response.message,
        data: {
          authorization: {
            mode: response?.meta?.authorization.mode,
            fields: response?.meta?.authorization.fields,
          },
          payment_payload: {
            ...payload,
            enckey: undefined,
          },
        },
      });
    }

    // For 3DS or VBV transactions, redirect users to their issue to authorize the transaction
    if (response?.meta?.authorization.mode === 'redirect') {
      const url = response.meta.authorization.redirect;
      // Redirect User to the authorization page to enter OTP
      open(url);

      return res.status(302).json({
        status: 'success',
        message: 'Redirecting to authorize transaction',
      });
    }

    return next(new AppError('An error occured. Please try again', 500));
  } catch (error) {
    return next(error);
  }
};
