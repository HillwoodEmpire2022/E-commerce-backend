import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide your email.'],
      unique: [true, 'Email already in use'],
      lowercase: true,
      trim: true,
    },

    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    photo: { type: String, default: 'default.jpg' },

    role: {
      type: String,
      enum: ['admin', 'seller', 'customer'],
      default: 'customer',
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },

    active: {
      type: Boolean,
      default: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },
    activationToken: String,

    passwordResetToken: String,
    passwordResetExpiresOn: Date,
    passwordChangedAt: Date,
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

// Method for generating six digits code for password reset and account activation
userSchema.methods.generateSixDigitsCode = function (option) {
  const code = crypto.randomInt(100000, 1000000).toString();

  if (option === 'activation') {
    // Hash the code
    this.activationToken = crypto.createHash('sha256').update(code).digest('hex');
  } else if (option === 'resetPassword') {
    // Hash the code
    this.passwordResetToken = crypto.createHash('sha256').update(code).digest('hex');
    // Lasts for 15 mininutes
    this.passwordResetExpiresOn = Date.now() + 15 * 60 * 1000;
  }

  return code;
};

// Hash Password
userSchema.pre('save', async function (next) {
  // CHECK IF PASSWORD WAS MODIFIED
  // IF NO, Return AND GO OVER
  if (!this.isModified('password')) return next();

  // IF YES HASH THE PASSWORD
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.virtual('profile', {
  ref: 'SellerProfile', // Model to populate from
  localField: '_id', // Field in this schema
  foreignField: 'user', // Field in the referenced model
});

const User = mongoose.model('User', userSchema);

export default User;
