import { verifyJWToken } from '../utils/jsonWebToken.js';
import User from '../models/user.js';

// Attach User to the request if one is authenticated
// Like is Logged in, but does not prevent user from getting accessing resource
export const checkUser = async (req, res, next) => {
  try {
    let token;

    // 1) GET THE TOKEN AND CHECK IF IT EXIST
    if (req.headers.authorization)
      token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return next();
    }

    // 2) VELIFY THE TOKEN (VERIFY AND CHECK TIMESPAN)
    const {
      userInfo: { id },
    } = verifyJWToken(token);

    // 3) CHECK IF USER STILL EXIST
    const currentUser = await User.findById(id);
    if (!currentUser) return next();

    // 5) ATTACH USER TO THE REQUESt
    req.user = currentUser;
    next();
  } catch (error) {
    return next();
  }
};
