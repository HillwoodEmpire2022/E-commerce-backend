// Import necessary modules, such as jsonwebtoken
import jwt from 'jsonwebtoken';

const decodeJWToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decoded;
  } catch (error) {
    console.error(error);
    return null; // Return null if token verification fails
  }
};

export default decodeJWToken;
