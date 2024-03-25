import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // User who placed the order
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Transaction Reference
    tx_ref: String,

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

    // Total price of the order
    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        'awaits payment',
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'transaction failed',
      ],
      default: 'awaits payment',
    },

    shippingAddress: {
      phoneNumber: { type: String, required: true },
      country: String,
      province: String,
      district: String,
      sector: String,
      cell: String,
      village: String,
      address: {
        type: {
          street: String,
          coordinates: {
            type: [Number],
            index: '2dsphere',
          },
        },
        geojson: true,
      },
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
