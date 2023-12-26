import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import {
  signupValidationSchema,
  loginValidationSchema,
} from "../validations/authValidations.js";
import { generateJWToken } from "../utils/jsonWebToken.js";
import { sendEmail } from "../utils/email.js";

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
    const verificationToken = jwt.sign(
      { email: email },
      process.env.JWT_SECRET_KEY
    );

    // 2) Create user
    const newUser = await User.create({ ...req.body, verificationToken });

    // 3) Send Verification Email
    // Frontend Url
    const url = `${process.env.CLIENT_LOCALHOST_URL}/user/verify-account/${verificationToken}`;

    // Email Obtions
    const emailOptions = {
      to: newUser.email,
      subject: "Email activation Link",
      text: `Hello ${newUser.firstName}, Welcome! to hill group!`,
      url,
    };

    try {
      await sendEmail(emailOptions);
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
  console.log("TOKES", activationToken);
  try {
    const decodeToken = jwt.verify(activationToken, process.env.JWT_SECRET_KEY);
    const { email } = decodeToken;

    console.log(decodeToken);

    const user = await User.findOne({ email });

    console.log(user);

    // if (!user) {
    //   return res.status(404).json({ message: "User not found." });
    // }
    // if (user.verified) {
    //   return res.status(400).json({ message: "Email already verified." });
    // }
    // user.verified = true;
    // await user.save();
    return res.status(200).json({ message: "Account verified successfully." });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Invalid token." });
  }
};

export const returnedUserInfo = (user) => {
  const displayedUserInfo = {
    _id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    role: user.role,
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

    const { error } = loginValidationSchema.validate(req.body, {
      errors: { label: "key", wrap: { label: false } },
    });
    if (error) {
      res.status(422).send({ message: error.message });
      return;
    }

    const account = await User.findOne({ email: email });
    if (!account) {
      res.status(401).send({ message: "Invalid credentials." });
    } else {
      const passwordCheck = await bcrypt.compare(
        password,
        account.hashedPassword
      );

      if (passwordCheck === false) {
        res.status(401).json({ message: "Invalid credentials." });
      } else if (passwordCheck === true) {
        const response = returnedUserInfo(account);
        res.status(200).json(response);
      }
    }
  } catch (error) {
    console.log(error);
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
