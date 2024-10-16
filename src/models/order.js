import mongoose from 'mongoose';

const paymentDetails = new mongoose.Schema(
  {
    customer: {
      id: String,
      name: String,
      email: String,
    },
    payment_type: {
      type: {
        type: String,
        enum: ['mobilemoneyrw', 'card'],
        required: true,
      },
      // If Mobile money: contains number
      mobile_number: String,

      // If Card: contains card details: first 6 and last 4 digits
      // Hidden From seller
      card: {
        first_6digits: {
          type: String,
        },
        last_4digits: {
          type: String,
        },
        issuer: {
          type: String,
        },
        country: {
          type: String,
        },
        type: {
          type: String,
        },
        expiry: {
          type: String,
        },
      },
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // User who placed the order
    // Hidden From seller
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Transaction Reference
    tx_ref: String,

    transactionId: Number,

    // Items in the order
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        seller: {
          type: String,
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        productThumbnail: { type: String, required: true },
        variation: {
          color: String,
          size: String,
        },

        sellerPaymentStatus: {
          type: String,
          enum: ['due', 'settled'],
          default: 'due',
        },
      },
    ],

    paymentDetails: paymentDetails,

    // Total price of the order
    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['awaits payment', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'awaits payment',
    },

    shippingAddress: {
      phoneNumber: { type: String, required: true },
      email: String,
      district: String,
      sector: String,
      street: String,
    },

    deliveryPreference: {
      type: String,
      enum: ['delivery', 'pickup'],
    },
  },
  {
    // Removes _id add id
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
      },
    },
    timestamps: true,
    versionKey: false,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
