import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { base64FileStringGenerator } from '../utils/base64Converter.js';

import SellerProfile from '../models/sellerProfile.js';
import User from '../models/user.js';

import UserProfile from '../models/userProfile.js';
import AppError from '../utils/AppError.js';
import { uploadProfileImageToCloudinary } from '../utils/cloudinary.js';
import { createdActivityLog, extractUserAgentdata } from '../utils/createActivityLog.js';
import sendEmail from '../utils/email.js';
import { generateJWToken } from '../utils/jsonWebToken.js';
import {
  emailValidation,
  loginValidationSchema,
  passwordValidation,
  signupValidationSchema,
} from '../validations/authValidations.js';
import { mongoIdValidator } from '../validations/mongoidValidator.js';
import { googleOath2passport } from '../utils/googleOath2passport.js';

// Refactor create Activity log
async function createActivityLogs(resource_id, req, doer, type, action, details, status) {
  const { ipAddress, browser, os } = extractUserAgentdata(req);

  const activity = {
    userId: doer?._id,
    activity: {
      type,
      action,
    },

    details,

    status,

    ipAddress,
    userAgent: {
      browser: `${browser.name} ${browser.version}`,
      os: ` ${os.name} ${os.version}`,
    },
  };

  await createdActivityLog(activity);

  return {
    browser,
    os,
  };
}

// ********* Register ************
export const userRegister = async (req, res, next) => {
  let sellerProfile, newUser, userProfile;
  const { email } = req.body;
  try {
    // 1) Validate user data
    const { error } = signupValidationSchema.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
    });

    if (error) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }

    // 2) Create user
    newUser = await User.create({
      ...req.body,
    });

    // If user is seller create seller profile
    if (req.body.role === 'seller') {
      sellerProfile = await SellerProfile.create({ user: newUser._id });
    } else {
      userProfile = await UserProfile.create({ user: newUser._id });
    }

    const verificationCode = newUser.generateSixDigitsCode('activation');

    // 2) Save user verification code/token
    await newUser.save({ validateBeforeSave: false });

    // 3) Send Verification Email
    // Frontend Url
    const url = `${
      process.env.CLIENT_URL || 'https://e-commerce-frontend-pi-seven.vercel.app'
    }/activate-account/${verificationCode}`;

    // Email Obtions
    const emailOptions = {
      to: newUser.email,
      subject: 'Email Verification Link',
      firstName: newUser.firstName,
      url,
      verificationCode,
    };

    try {
      await sendEmail(emailOptions, 'account-activation');
    } catch (error) {
      await User.findByIdAndDelete(newUser._id);
      await SellerProfile.findByIdAndDelete(sellerProfile?._id);
      await UserProfile.findByIdAndDelete(userProfile?._id);
      return next(error);
    }

    // 4) Send Successful response
    res.status(201).json({
      status: 'success',
      activationToken: process.env.NODE_ENV === 'test' ? verificationCode : undefined,
      data: 'Check your inbox to verify your email address.',
    });
  } catch (error) {
    await User.findByIdAndDelete(newUser?._id);
    await SellerProfile.findByIdAndDelete(sellerProfile?._id);
    await UserProfile.findByIdAndDelete(userProfile?._id);
    if (error.code === 11000) {
      next(new AppError(`Email (${email}) already in use.`, 400));
    }

    next(error);
  }
};

// ********* Verify Account **********
export const verifyEmail = async (req, res) => {
  const { activationToken } = req.params;
  try {
    // 1) GET USER BASED ON TOKEN
    const hashedToken = crypto.createHash('sha256').update(activationToken).digest('hex');

    const user = await User.findOne({ activationToken: hashedToken });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found.',
      });
    }

    if (user.verified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already verified.',
      });
    }

    user.verified = true;
    user.activationToken = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Email verified successfully.',
    });
  } catch (err) {
    next(err);
  }
};

export const returnedUserInfo = (user) => {
  const displayedUserInfo = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    email: user.email,
    twoFactorAuthEnabled: user.twoFactorAuthEnabled,
    profileImageUrl: user.photo,
  };

  const userToken = generateJWToken({
    id: user._id,
    role: user.role,
  });
  return {
    token: userToken,
    user: displayedUserInfo,
  };
};

export const userLogin = async (req, res, next) => {
  let otp;
  try {
    let { email, password } = req.body;

    // Validate user information with joi.
    const { error } = loginValidationSchema.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
    });

    if (error) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }

    const user = await User.findOne({
      email: email,
    }).select('+password');

    // Check if use does not exist
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials.',
      });
    }

    // Check if account in verified
    if (!user.verified)
      return res.status(401).json({
        status: 'fail',
        message:
          'Your email has not been verified yet. Please check your inbox for the verification link or click here to resend the verification email.',
      });

    // Check if user account is active
    if (!user.active)
      return res.status(403).json({
        status: 'fail',
        message: 'Your account has been temporarily closed! Contact customer support for help.',
      });

    // Check password
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials.',
      });
    }
    const response = returnedUserInfo(user);

    // Check if user set up 2FA and create otp
    if (user.twoFactorAuthEnabled) {
      otp = user.generateSixDigitsCode('otp');
      await user.save({ validateBeforeSave: false });

      // Send Email containing OTP
      const emailOptions = {
        to: user.email,
        subject: 'Login OTP (Expires in 15 Minutes)',
        otp,
      };

      try {
        await sendEmail(emailOptions, 'sign-in-otp');

        return res.status(200).json({ status: 'success', message: 'OTP sent to your email' });
      } catch (error) {
        console.error(error);
        return next(new AppError('There was an error sending email! Please try again.', 500));
      }
    }
    // // Create activity Log
    const { os, browser } = await createActivityLogs(
      user._id,
      req,
      user._id,
      'security',
      'login',
      'New login',
      'success'
    );

    // Send Email
    const emailOptions = {
      to: user.email,
      subject: 'Security Alert: New Sign-in',
      text: {
        heading: `A new sign-in on ${os.name} ${os.version}`,
        message: `We noticed a new sign-in to your account on a ${os.name} ${os.version} device via ${browser?.name} ${browser.version}. If this was you, you don’t need to do anything. If not, click on the button below to secure your account.`,
        button: {
          text: 'Secure your account',
          url: `${process.env.CLIENT_URL}/forgot-password`,
        },
      },
    };

    try {
      await sendEmail(emailOptions, 'security-activity');
    } catch (error) {
      console.error(error);
    }

    res.status(200).json({
      status: 'success',
      token: response.token,
      data: {
        user: response.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Account info of user (email, names, role)
export const getMe = async (req, res) => {
  const { email, role, id, firstName, lastName, photo } = req.user;

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id,
        email,
        firstName,
        lastName,
        photo,
        role,
      },
    },
  });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const { error } = emailValidation.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
    });
    if (error) {
      res.status(422).send({ message: error.message });
      return;
    }

    const checkUserEmail = await User.findOne({
      email: email,
    });

    if (!checkUserEmail) {
      return res.status(404).json({ message: 'email does not exist' });
    }

    const otp = checkUserEmail.generateSixDigitsCode('resetPassword');
    // 2) Save user verification code/token
    await checkUserEmail.save({ validateBeforeSave: false });

    const url = `${process.env.CLIENT_URL}/reset-password/${otp}`;

    const emailOptions = {
      to: email,
      subject: 'Reset password Link (Expires in 15 Minutes)',
      firstName: checkUserEmail.firstName,
      url,
      otp,
    };
    await sendEmail(emailOptions, 'forgot-password');
    return res.status(201).json({
      message: 'check your email to reset password',
    });
  } catch (error) {
    next(error);
  }
};

export const resetUserPassword = async (req, res, next) => {
  const { resetUserToken } = req.params;
  const { newPassword, confirmPassword } = req.body;

  const { error } = passwordValidation.validate(
    { password: newPassword, confirmPassword },
    {
      errors: { label: 'key', wrap: { label: false } },
      allowUnknown: true,
    }
  );

  if (error) {
    return next(new AppError(error.message, 400));
  }

  if (newPassword != confirmPassword) {
    return res.status(400).json({ message: 'passwords do not match' });
  }

  try {
    // 1) GET USER BASED ON TOKEN
    const hashedToken = crypto.createHash('sha256').update(resetUserToken).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpiresOn: { $gt: Date.now() } });

    if (!user) {
      return next(new AppError('Otp is invalid or has expired! Please request for a new otp.', 404));
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    user.passwordResetToken = undefined;
    user.passwordResetExpiresOn = undefined;
    await user.save();

    try {
      // Create Activity Log
      await createActivityLogs(user._id, req, user._id, 'security', 'password_reset', 'Password was reset', 'success');
    } catch (error) {
      return res.status(201).json({ message: 'password reset successfully' });
    }

    return res.status(201).json({ message: 'password reset successfully' });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    //  find user by Id
    const userId = req.user._id;
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        message: 'user not found',
      });
    }

    console.log(req.body);

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // validate password
    try {
      await passwordValidation.validateAsync({
        password: newPassword,
        confirmPassword,
      });
    } catch (validationError) {
      return res.status(400).json({
        message: validationError.message,
      });
    }

    // compare currentPassword and password
    const comparePassword = await bcrypt.compare(currentPassword, user.password);

    if (!comparePassword) {
      return res.status(404).json({
        message: 'current password does not mutch',
      });
    }

    if (newPassword != confirmPassword) {
      return res.status(400).json({
        message: 'password doesn not match',
      });
    }

    //  update password with newPassword
    const hashPassword = await bcrypt.hash(newPassword, 12);
    await User.findOneAndUpdate(
      { _id: userId },
      { $set: { password: hashPassword, passwordChangedAt: new Date() } },
      { new: true }
    );

    // Create Activity Log
    try {
      // Create Activity Log
      await createActivityLogs(
        user._id,
        req,
        user._id,
        'security',
        'password_change',
        'Password was upadated',
        'success'
      );
    } catch (error) {
      console.log(error);
    }

    return res.status(201).json({
      message: 'password updated succesfully',
    });
  } catch (error) {
    next(error);
  }
};

export const userUpdatePhoto = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!req.file || !allowedImageTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: 'Invalid image format. Allowed formats: JPEG, PNG, JPG',
      });
    }

    let profileImageString = base64FileStringGenerator(req.file).content;

    if (!profileImageString) {
      return res.status(400).json({
        message: 'There is no profile image attached.',
      });
    }

    const uploadedProfileImage = await uploadProfileImageToCloudinary(profileImageString, user.userName);

    user.photo = uploadedProfileImage.url;
    await user.save();

    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update profile picture',
    });
  }
};

// user update personal information
export const userUpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById({ _id: userId });

    if (!user) {
      return res.status(400).json({ message: 'user not found' });
    }
    const { firstName, lastName } = req.body;

    const newUser = await User.findOneAndUpdate({ _id: userId }, { firstName, lastName }, { new: true });

    return res.status(201).json({
      message: 'successfull to update profile',
      newUser,
    });
  } catch (error) {
    return res.status(500).json({ message: 'failed to update profile' });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = userRole === 'admin' ? req.params.id : req.user._id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted',
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error',
    });
  }
};

// Request for activation email
export const requestVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user with provided email exists
    const user = await User.findOne({ email });

    if (!user) return next(new AppError('User with provided email does not exist.', 404));

    // Create activation token
    const verificationCode = user.generateSixDigitsCode('activation');

    await user.save({
      validateBeforeSave: false,
    });

    // Send Verification Email
    const url = `${
      process.env.CLIENT_URL || 'https://e-commerce-frontend-pi-seven.vercel.app'
    }/activate-account/${verificationCode}`;

    // Email Obtions
    const emailOptions = {
      to: user.email,
      subject: 'Email Verification Link',
      firstName: user.firstName,
      url,
      verificationCode,
    };

    try {
      await sendEmail(emailOptions, 'account-activation');
    } catch (error) {
      console.error(error);
      return next(new AppError('There was an error sending email! Please try again.', 500));
    }

    // 4) Send Successful response
    res.status(200).json({
      status: 'success',
      activationToken: process.env.NODE_ENV === 'test' ? activationToken : undefined,
      data: 'A verification link has been sent to your email address. Please check your inbox and follow the instructions to verify your account.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error.',
    });
  }
};

export const deactivateAccount = async (req, res, nex) => {
  try {
    const { error } = mongoIdValidator.validate(req.params, {
      errors: { label: 'key', wrap: { label: false } },
    });

    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message,
      });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        active: false,
      },
      {
        new: true,
      }
    );

    if (!user)
      return res.status(404).json({
        status: 'fail',
        message: 'User not found.',
      });

    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error.',
    });
  }
};

// 2FA
export const enableTwoFactorAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    if (user.twoFactorAuthEnabled) {
      return next(new AppError('Two factor authentication is already enabled.', 400));
    }

    user.twoFactorAuthEnabled = true;
    user.recoveryOptions = { emails: [] };
    user.recoveryOptions.emails.push({ email: user.email, verified: true });

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Two factor authentication enabled.',
    });
  } catch (error) {
    next(error);
  }
};

// Verify Otp
export const verifyOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return next(new AppError('Please provide OTP.', 400));
    }

    const hashedToken = crypto.createHash('sha256').update(String(otp)).digest('hex');

    const user = await User.findOne({
      'twoFactorAuthOtp.otp': hashedToken,
      'twoFactorAuthOtp.expiresOn': { $gt: Date.now() },
    });

    if (!user) {
      return res.status(403).json({
        status: 'fail',
        message: 'Invalid OTP or OTP has expired.',
      });
    }

    user.twoFactorAuthOtp.otp = undefined;
    user.twoFactorAuthOtp.expiresOn = undefined;
    await user.save();

    // // Create activity Log
    const { os, browser } = await createActivityLogs(
      user._id,
      req,
      user._id,
      'security',
      'login',
      'New login',
      'success'
    );

    // Send Email
    const emailOptions = {
      to: user.email,
      subject: 'Security Alert: New Sign-in',
      text: {
        heading: `A new sign-in on ${os.name} ${os.version}`,
        message: `We noticed a new sign-in to your account on a ${os.name} ${os.version} device via ${browser?.name} ${browser.version}. If this was you, you don’t need to do anything. If not, click on the button below to secure your account.`,
        button: {
          text: 'Secure your account',
          url: `${process.env.CLIENT_URL}/forgot-password`,
        },
      },
    };

    try {
      await sendEmail(emailOptions, 'security-activity');
    } catch (error) {
      console.error(error);
    }

    const response = returnedUserInfo(user);

    return res.status(200).json({
      status: 'success',
      token: response.token,
      data: {
        user: response.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleOathCallback = async (req, res) => {
  const user = req.user;

  const response = returnedUserInfo(user);

  // // Create activity Log
  const { os, browser } = await createActivityLogs(
    user._id,
    req,
    user._id,
    'security',
    'login',
    'New login',
    'success'
  );

  // Send Email
  const emailOptions = {
    to: user.email,
    subject: 'Security Alert: New Sign-in',
    text: {
      heading: `A new sign-in on ${os.name} ${os.version}`,
      message: `We noticed a new sign-in to your account on a ${os.name} ${os.version} device via ${browser?.name} ${browser.version}. If this was you, you don’t need to do anything. If not, click on the button below to secure your account.`,
      button: {
        text: 'Secure your account',
        url: `${process.env.CLIENT_URL}/forgot-password`,
      },
    },
  };

  try {
    await sendEmail(emailOptions, 'security-activity');
  } catch (error) {
    console.error(error);
  }

  const nodeEnv = process.env.NODE_ENV;
  const clientUrl =
    nodeEnv === 'production'
      ? process.env.CLIENT_PRODUCTION_URL
      : nodeEnv === 'development'
      ? process.env.CLIENT_DEV_URL
      : process.env.CLIENT_STAGING_URL;

  res.redirect(`${clientUrl}/auth/callback?token=${response.token}`);
};
