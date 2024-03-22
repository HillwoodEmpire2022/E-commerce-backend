import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Order from '../models/order.js';
import PaypackJs from 'paypack-js';
import removeEmptySpaces from '../utils/removeEmptySpaces.js';
import Product from '../models/product.js';

const paypack = new PaypackJs.default({
  client_id: process.env.PAYPACK_APP_ID,
  client_secret: process.env.PAYPACK_APP_SECRET,
});

const findTransaction = async (ref) => {
  let {
    data: { transactions },
  } = await paypack.events({
    transaction_ref: ref,
  });

  let data = transactions.find(
    ({ data }) => data.ref === ref && data.status === 'successful'
  );

  return data;
};

export const checkout = async (req, res, next) => {
  try {
    let checkout,
      order,
      timeOut = 0;
    const customerId = req.user._id;
    const orderData = { ...req.body, customer: customerId };

    const session = await mongoose.startSession();

    // Requesting Payment and creating order
    await session.withTransaction(async () => {
      // Request for payment
      checkout = await paypack.cashin({
        number: req.body.phoneNumber,
        amount: req.body.amount,
        environment: process.env.NODE_ENV,
      });

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
      // TODO Send Order Id for user to track order, Inform user to use *182*7*1# to pay
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

    // Payment was successfull
    // Update order status to pending
    order[0].status = removeEmptySpaces('pending');
    order[0].tx_ref = checkout.data.ref;

    await order[0].save({
      validateBeforeSave: false,
    });

    // TODO PAYMENT PENDING: THIS DOES NOT RUN AND USER PAYS LATER, OPTIONS WEBHOOK OR REPORT
    // Update Ordered Products quantities
    const orderProducts = order[0].items;
    orderProducts.forEach(async (product) => {
      // Find the product
      const orderProduct = await Product.findById(product.product);

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
                  variation.colorImg.colorName === orderedCombination.color &&
                  variation.measurementvalue === orderedCombination.size
                );

              // Only color
              if (orderedCombination.hasOwnProperty('color')) {
                return (
                  variation.colorImg.colorName === orderedCombination.color
                );
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

export const webhook = async (req, res, next) => {};
