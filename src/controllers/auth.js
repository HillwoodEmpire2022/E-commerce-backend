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

const returnedUserInfo = (user) => { 
  const displayedUserInfo = {
    _id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    role: user.role,
    profileImageUrl: user.profileImageUrl,
  }

  const userToken = generateJWToken(user._id);
  return {
    token: userToken,
    user: displayedUserInfo
  }
}

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
    const response = returnedUserInfo(savedUser)

    res.status(201).json(response);
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
      return
    }

    let userInfo = {};
    const account = await User.findOne({ email: email });
    if (!account) {
      res.status(401).send({ message: "The email provided does not exist." });
    } else {
      const passwordCheck = bcrypt.compare(
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

        const response = returnedUserInfo(account)
        res.status(200).json(response);
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const googleAuthenticationSuccess = (req, res) => {
  try { 
    const response = returnedUserInfo(req.user._conditions._id)
    res.status(200).json(response)   
  } catch (err) {
    res.status(500).json({ err: err.message})
  }

};


