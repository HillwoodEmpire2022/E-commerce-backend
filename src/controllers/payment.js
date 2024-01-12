import Flutterwave from 'flutterwave-node-v3';
// import got from 'got';
import axios from 'axios';
import mongoose from 'mongoose';
import Order from '../models/order.js';

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
    'https://api.flutterwave.com/v3/payments',
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
  const { amount, currency } = order;
  const { email, firstName, lastName } = req.user;
  const redirect_url =
    process.env.NODE_ENV === 'development'
      ? 'https://webhook.site/001bcb79-7d96-40e3-a77d-b5edb15e5dde'
      : 'https://feli-globalmakert.onrender.com/api/v1/payments/callback';

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

    // res.status(200).json(checkoutResponse);
    res.redirect(200, checkoutResponse.data.link);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// TODO Update Order, products, and verify transaction
export const verifyTransaction = async (req, res) => {
  // Verify Transaction
  const respose = await verifyTrans(String(req.body.data.id));

  // Update Products Quantities
  if (respose.data.status !== 'successful')
    return res.status(500).json({
      status: 'error',
      message:
        'There was an error processing payment! Please try again later.',
    });

  const order = await Order.findOne({
    tx_ref: respose.data.tx_ref,
  });

  order.status = 'pending';
  order.transId = respose.data.id;

  await order.save({
    validateBeforeSave: false,
  });

  res.redirect('https://hillglobalmarket.netlify.app');
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
