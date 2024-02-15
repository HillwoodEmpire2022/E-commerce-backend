import mongoose from "mongoose";

const SellerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    phoneNumber: {
      type: String,
    },

    companyEmail: {
      type: String,
    },

    companyName: {
      type: String,
    },

    website: String,

    logo: String,

    bankAccount: {
      bank: String,
      accountName: String,
      accountNumber: Number,
      accountHolderName: String,
    },

    cardNumber: Number,
    active: {
      type: Boolean,
      default: false,
    },

    locations: [
      {
        type: {
          address: String,
          coordinates: {
            type: [Number],
            index: "2dsphere",
          },
        },
        geojson: true,
      },
    ],
  },
  {
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

const SellerProfile = mongoose.model("SellerProfile", SellerProfileSchema);
export default SellerProfile;
