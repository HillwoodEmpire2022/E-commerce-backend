import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    phoneNumber: {
      type: String,
    },

    address: {
      district: String,
      sector: String,
      street: String,
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

const UserProfile = mongoose.model('UserProfile', UserProfileSchema);
export default UserProfile;
