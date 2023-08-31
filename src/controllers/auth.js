import User from "../models/user.js";
import bcrypt from "bcrypt";
import {
  signupValidationSchema,
  loginValidationSchema,
} from "../validations/authValidations.js";
import dotenv from "dotenv";
import { generateUserName } from "../utils/userNameGenerator.js";
import generateJWToken from "../utils/jwToken.js";

dotenv.config();

export const userRegister = async (req, res) => {
  try {
    let { firstname, lastname, email, password } = req.body;

    const { error } = signupValidationSchema.validate(req.body, {
      errors: { label: "key", wrap: { label: false } },
    });
    if (error) {
      res.status(422).send({ message: error.message });
      return;
    }
    const existingUser = await User.findOne({ email: email });

    if (existingUser && existingUser.googleId === null) {
      res
        .status(409)
        .json({ message: `A user with email: ${email} already exists.` });
      return;
    }

    const salt = await bcrypt.genSalt();
    const passwordHarsh = await bcrypt.hash(password, salt);

    firstname =
      firstname.charAt(0).toUpperCase() + firstname.slice(1).toLowerCase();
    lastname =
      lastname.charAt(0).toUpperCase() + lastname.slice(1).toLowerCase();

    const newUserName = await generateUserName();

    const newUser = {
      firstname,
      lastname,
      username: newUserName,
      email,
      hashedPassword: passwordHarsh,
    };

    const savedUser = await User.create(newUser);
    const userToken = generateJWToken(savedUser._id);

    res.status(201).json({
      userToken,
      user: savedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const userLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    const { error } = loginValidationSchema.validate(req.body, {
      errors: { label: "key", wrap: { label: false } },
    });
    if (error) {
      res.status(422).send({ message: error.message });
    }

    let userInfo = {};
    const account = await User.findOne({ email: email });
    if (!account) {
      res.status(401).send({ message: "The email provided does not exist." });
    } else {
      const passwordCheck = await bcrypt.compare(
        password,
        account.hashedPassword
      );

      if (!passwordCheck) {
        res.status(401).send({ message: "Wrong password." });
      } else {
        userInfo = {
          _id: account._id,
          firstname: account.firstname,
          lastname: account.lastname,
          username: account.username,
          role: account.role,
          profileImageUrl: account.profileImageUrl,
        };

        const userToken = generateJWToken(account._id);

        res.status(200).json({
          token: userToken,
          user: userInfo,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const googleAuthenticationSuccess = (payload) => {
  try {  
    const displayedUserInfo = {
      _id: payload._id,
      firstname: payload.firstname,
      lastname: payload.lastname,
      username: payload.username,
      role: payload.role,
      profileImageUrl: payload.profileImageUrl,
    }

    const userToken = generateJWToken(payload.id);
    return {
      token: userToken,
      user: displayedUserInfo
    }   

  } catch (err) {
    return err.message
  }

};
