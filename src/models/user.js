import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
const recoveryEmail = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    verified: { type: Boolean, default: false },
  },
  {
    _id: false,
  }
);

const recoveryOptions = new mongoose.Schema(
  {
    emails: [recoveryEmail],
  },
  { _id: false }
);

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

    twoFactorAuthEnabled: {
      type: Boolean,
      default: false,
    },

    recoveryOptions: recoveryOptions,

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

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedPasswordAt = parseInt(this.passwordChangedAt.getTime() / 1000);
    // Return true or false
    return JWTTimestamp < changedPasswordAt;
  }
  // Not changed
  return false;
};

userSchema.virtual('profile', {
  ref: 'SellerProfile', // Model to populate from
  localField: '_id', // Field in this schema
  foreignField: 'user', // Field in the referenced model
});

const User = mongoose.model('User', userSchema);

export default User;
