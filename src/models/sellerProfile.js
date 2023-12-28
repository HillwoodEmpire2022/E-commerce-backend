import mongoose from "mongoose";

const SellerProfileSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    companyEmail: {
      type: String,
    },

    companyName: {
      type: String,
      required: true,
    },

    website: String,

    logo: String,

    bankAccount: {
      bank: String,
      accountName: String,
      accountNumber: Number,
    },

    cardNumber: Number,

    location: {
      type: {
        address: String,
        coordinates: {
          type: [Number],
          index: "2dsphere",
        },
      },
      geojson: true,
    },
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

const SellerProfile = mongoose.model("Seller", SellerProfileSchema);
export default SellerProfile;
