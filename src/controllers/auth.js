import User from "../models/user.js";
import bcrypt from "bcrypt";
import {
  signupValidationSchema,
  loginValidationSchema,
  emailValidation,
} from "../validations/authValidations.js";
import { generateJWToken } from "../utils/jsonWebToken.js";

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

export const generateUserName = async () => {
  const recentRegisteredUser = await User.find().sort({ _id: -1 }).limit(1);
  let newUserName = "";

  if (recentRegisteredUser.length !== 0) {
    const collectionCount = recentRegisteredUser[0].username.slice(4);
    newUserName = `user${parseInt(collectionCount) + 1}`;
  } else {
    newUserName = `user${1}`;
  }

  return newUserName;
};

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

    if (existingUser && !existingUser.googleId) {
      res.status(409).json({
        message: `A user with email: ${email} already exists.`,
      });
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
    const response = returnedUserInfo(savedUser);

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

export const resetUserPassword = async (req, res, user) => {
  try {
    const {email} = req.body;

    
    const { error } = emailValidation.validate(req.body, {
      errors: { label: "key", wrap: { label: false } },
    });
    if (error) {
      res.status(422).send({ message: error.message });
      return;
    }
    

    const checkUserEmail = await User.findOne({email:email});

    if(!checkUserEmail){
      return res.status(404).json({message:"email does not exist"});
    }

  const userToken = generateJWToken({ id: user._id, role: user.role , email:user.email});

  return res.status(201).json({message:"check your email to reset password", userToken});
   
  } catch (error) {
    console.log(error);
    return res.status(500).json({message:"failed to reset password"});
  }

};

export const resetPassword = (req, res) => {
  try {
    const{newPassword, confirmPassword} = req.body;

  } catch (error) {
    return res.status(500).jsnon({"message":"failed to user password"});
  }
}