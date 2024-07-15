import jwt from 'jsonwebtoken';

export const generateJWToken = (userInfo) => {
  try {
    const userToken = jwt.sign({ userInfo }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
    return userToken;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const verifyJWToken = (userToken) => {
  try {
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
    return decoded;
  } catch (error) {
    throw error;
  }
};
