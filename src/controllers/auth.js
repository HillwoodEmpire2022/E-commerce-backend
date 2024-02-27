import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { base64FileStringGenerator } from '../utils/base64Converter.js';

import User from '../models/user.js';
import SellerProfile from '../models/sellerProfile.js';
import {
  signupValidationSchema,
  loginValidationSchema,
  emailValidation,
  passwordValidation,
  uploadProfileValidation,
} from '../validations/authValidations.js';
import { generateJWToken } from '../utils/jsonWebToken.js';
import { sendActivationEmail } from '../utils/activationEmail.js';
import { sendEmail } from '../utils/sendEmail.js';
import { uploadProfileImageToCloudinary } from '../utils/cloudinary.js';

// ********* Register ************
export const userRegister = async (req, res, next) => {
  const { email } = req.body;
  try {
    // 1) Validate user data
    const { error } = signupValidationSchema.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
    });

    if (error) {
      return res
        .status(400)
        .json({ status: 'fail', message: error.message });
    }
    // Generate verification token
    const activationToken = jwt.sign(
      { email: email },
      process.env.JWT_SECRET_KEY
    );

    // 2) Create user
    const newUser = await User.create({
      ...req.body,
      activationToken,
    });

    // If user is seller create seller profile
    if (req.body.role === 'seller') {
      await SellerProfile.create({ user: newUser._id });
    }

    // 3) Send Verification Email
    // Frontend Url
    const url = `${
      process.env.CLIENT_URL ||
      'https://e-commerce-frontend-pi-seven.vercel.app'
    }/activate-account/${activationToken}`;

    // Email Obtions
    const emailOptions = {
      to: newUser.email,
      subject: 'Email activation Link',
      text: `Hello ${newUser.firstName}, Welcome! to hill group!`,
      url,
    };

    try {
      await sendActivationEmail(emailOptions);
    } catch (error) {
      console.log(error);
      // TODO: Delete user or use transaction.
      return res.status(500).json({
        status: 'fail',
        message:
          'there was an error sending email! Please try again.',
      });
    }

    // 4) Send Successful response
    res.status(201).json({
      status: 'success',
      activationToken:
        process.env.NODE_ENV === 'test' ? activationToken : undefined,
      data: 'Email to activate your account was sent to your email.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: `Email (${email}) already in use.`,
      });
    }
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// ********* Verify Account **********
export const activateAccount = async (req, res) => {
  const { activationToken } = req.params;
  try {
    const decodeToken = jwt.verify(
      activationToken,
      process.env.JWT_SECRET_KEY
    );
    const { email } = decodeToken;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'User not found.' });
    }

    if (user.verified) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Email already verified.' });
    }

    user.verified = true;
    user.activationToken = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    return res
      .status(200)
      .json({
        status: 'success',
        message: 'Account Activated successfully.',
      });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

export const returnedUserInfo = (user) => {
  const displayedUserInfo = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    email: user.email,
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

export const userLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Validate user information with joi.
    const { error } = loginValidationSchema.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
    });
    if (error) {
      return res
        .status(400)
        .json({ status: 'fail', message: error.message });
    }

    const user = await User.findOne({ email: email }).select(
      '+password'
    );

    // Check if use does not exist
    if (!user) {
      return res
        .status(401)
        .json({ status: 'fail', message: 'Invalid credentials.' });
    }

    // Check if account in verified
    if (!user.verified)
      return res.status(401).json({
        status: 'fail',
        message:
          'Account not activated! Check your email to activate your account.',
      });

    // Check password
    if (!(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ status: 'fail', message: 'Invalid credentials.' });
    }
    const response = returnedUserInfo(user);

    res.status(200).json({
      status: 'success',
      token: response.token,
      data: {
        user: response.user,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

export const googleAuthenticationSuccess = (req, res) => {
  try {
    const response = returnedUserInfo(req.user);
    return res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

export const forgotPassword = async (req, res, user) => {
  try {
    const { email } = req.body;

    const { error } = emailValidation.validate(req.body, {
      errors: { label: 'key', wrap: { label: false } },
    });
    if (error) {
      res.status(422).send({ message: error.message });
      return;
    }

    const checkUserEmail = await User.findOne({ email: email });

    if (!checkUserEmail) {
      return res
        .status(404)
        .json({ message: 'email does not exist' });
    }

    const resetUserToken = encodeURIComponent(
      jwt.sign({ email: email }, process.env.JWT_SECRET_KEY, {
        expiresIn: '1h',
      })
    );

    const url = `${process.env.CLIENT_LOCALHOST_URL}/reset-password/${resetUserToken}`;

    const emailOptions = {
      to: email,
      subject: 'Email reset password Link',
      text: `Hello ${email}, Welcome! to hill group! request has been recieved to reset password.`,
      url,
    };
    await sendEmail(emailOptions);
    return res
      .status(201)
      .json({ message: 'check your email to reset password' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'failed to  reset password' });
  }
};

export const resetUserPassword = async (req, res) => {
  const { resetUserToken } = req.params;
  try {
    const verifyToken = jwt.verify(
      resetUserToken,
      process.env.JWT_SECRET_KEY
    );

    const { email } = verifyToken;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'user  not found' });
    }

    const { newPassword, confirmPassword } = req.body;

    try {
      await passwordValidation.validateAsync({
        password: newPassword,
        confirmPassword,
      });
    } catch (validationError) {
      return res
        .status(400)
        .json({ message: validationError.message });
    }

    if (newPassword != confirmPassword) {
      return res
        .status(400)
        .json({ message: 'password does not match' });
    }

    user.password = newPassword;
    await user.save();

    return res
      .status(201)
      .json({ message: 'password reset successfully' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: 'failed to reset user password' });
  }
};

export const updatePassword = async (req, res) => {
  try {
    //  find user by Id
    const userId = req.user._id;
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        message: 'user not found',
      });
    }
    const { currentPassword, newPassword, confirmPassword } =
      req.body;

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
    const comparePassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

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
      { $set: { password: hashPassword } },
      { new: true }
    );

    return res.status(201).json({
      message: 'password updated succesfully',
    });
  } catch (error) {
    return res.status(500).json({
      massage: 'failed to update password',
    });
  }
};

export const userUpdatePhoto = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];

    if (!req.file || !allowedImageTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message:
          'Invalid image format. Allowed formats: JPEG, PNG, JPG',
      });
    }

    let profileImageString = base64FileStringGenerator(
      req.file
    ).content;

    if (!profileImageString) {
      return res
        .status(400)
        .json({ message: 'There is no profile image attached.' });
    }

    const uploadedProfileImage = await uploadProfileImageToCloudinary(
      profileImageString,
      user.userName
    );

    user.photo = uploadedProfileImage.url;
    await user.save();

    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to update profile picture' });
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

    const newUser = await User.findOneAndUpdate(
      { _id: userId },
      { firstName, lastName },
      { new: true }
    );

    return res.status(201).json({
      message: 'successfull to update profile',
      newUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'failed to update profile' });
  }
};
