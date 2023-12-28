import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import SellerProfile from "../models/sellerProfile.js";
import {
  signupValidationSchema,
  loginValidationSchema,
  emailValidation,
  passwordValidation,
} from "../validations/authValidations.js";
import { generateJWToken } from "../utils/jsonWebToken.js";
import { sendActivationEmail } from "../utils/activationEmail.js";
import { sendEmail } from "../utils/sendEmail.js";

// ********* Register ************
export const userRegister = async (req, res, next) => {
  const { email } = req.body;
  try {
    // 1) Validate user data
    const { error } = signupValidationSchema.validate(req.body, {
      errors: { label: "key", wrap: { label: false } },
    });

    if (error) {
      return res.status(400).json({ status: "fail", message: error.message });
    }
    // Generate verification token
    const activationToken = jwt.sign(
      { email: email },
      process.env.JWT_SECRET_KEY
    );

    // 2) Create user
    const newUser = await User.create({ ...req.body, activationToken });

    // If user is seller create seller profile
    if (req.body.role === "seller") {
      await SellerProfile.create({ seller: newUser._id });
    }

    // 3) Send Verification Email
    // Frontend Url
    const url = `${process.env.CLIENT_LOCALHOST_URL}/user/verify-account/${activationToken}`;

    // Email Obtions
    const emailOptions = {
      to: newUser.email,
      subject: "Email activation Link",
      text: `Hello ${newUser.firstName}, Welcome! to hill group!`,
      url,
    };

    try {
      await sendActivationEmail(emailOptions);
    } catch (error) {
      console.log(error);
      // TODO: Delete user or use transaction.
      return res.status(500).json({
        status: "fail",
        message: "there was an error sending email! Please try again.",
      });
    }

    // 4) Send Successful response
    res.status(201).json({
      status: "success",
      data: "Email to activate your account was sent to your email.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: "fail",
        message: `Email (${email}) already in use.`,
      });
    }
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// ********* Verify Account **********
export const activateAccount = async (req, res) => {
  const { activationToken } = req.params;
  try {
    const decodeToken = jwt.verify(activationToken, process.env.JWT_SECRET_KEY);
    const { email } = decodeToken;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found." });
    }

    if (user.verified) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email already verified." });
    }

    user.verified = true;
    user.activationToken = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    return res
      .status(200)
      .json({ status: "success", message: "Account Activated successfully." });
  } catch (err) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

export const returnedUserInfo = (user) => {
  const displayedUserInfo = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
  };

  const userToken = generateJWToken({ id: user._id, role: user.role });
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
      errors: { label: "key", wrap: { label: false } },
    });
    if (error) {
      return res.status(400).json({ status: "fail", message: error.message });
    }

    const user = await User.findOne({ email: email });

    // Check if use does not exist
    if (!user) {
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid credentials." });
    }

    // Check if account in verified
    if (!user.verified)
      return res.status(401).json({
        status: "fail",
        message:
          "Account not activated! Check your email to activate your account.",
      });

    // Check password
    if (!(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid credentials." });
    }
    const response = returnedUserInfo(user);

    res.status(200).json({
      status: "success",
      token: response.token,
      data: {
        user: response.user,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const googleAuthenticationSuccess = (req, res) => {
  try {
    const response = returnedUserInfo(req.user);
    return res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

export const sendEmailToResetPassword = async (req, res, user) => {
  try {
    const { email } = req.body;

    const { error } = emailValidation.validate(req.body, {
      errors: { label: "key", wrap: { label: false } },
    });
    if (error) {
      res.status(422).send({ message: error.message });
      return;
    }

    const checkUserEmail = await User.findOne({ email: email });

    if (!checkUserEmail) {
      return res.status(404).json({ message: "email does not exist" });
    }

    const resetUserToken = encodeURIComponent(
      jwt.sign({ email: email }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1h",
      })
    );

    const url = `${process.env.CLIENT_LOCALHOST_URL}/user/reset-password/${resetUserToken}`;

    const emailOptions = {
      to: email,
      subject: "Email reset password Link",
      text: `Hello ${email}, Welcome! to hill group! request has been recieved to reset password.`,
      url,
    };
    await sendEmail(emailOptions);
    return res
      .status(201)
      .json({ message: "check your email to reset password" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "failed to  reset password" });
  }
};

export const resetUserPassword = async (req, res) => {
  const { resetUserToken } = req.params;
  try {
    const verifyToken = jwt.verify(resetUserToken, process.env.JWT_SECRET_KEY);

    const { email } = verifyToken;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "user  not found" });
    }

    const { newPassword, confirmPassword } = req.body;

    try {
      await passwordValidation.validateAsync({
        password: newPassword,
        confirmPassword,
      });
    } catch (validationError) {
      return res.status(400).json({ message: validationError.message });
    }

    if (newPassword != confirmPassword) {
      return res.status(400).json({ message: "password doesn not match" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // update user with new password

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(201).json({ message: "password  reset successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "failed to reset user password" });
  }
};
