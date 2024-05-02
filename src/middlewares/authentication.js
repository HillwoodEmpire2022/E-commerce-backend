import { verifyJWToken } from '../utils/jsonWebToken.js';
import User from '../models/user.js';

// Protect
export const isLoggedIn = async (req, res, next) => {
  try {
    let token;

    // 1) GET THE TOKEN AND CHECK IF IT EXIST
    if (req.headers.authorization)
      token = req.headers.authorization.split(' ')[1];

    if (!token) {
      res.status(401).json({
        status: 'fail',
        message:
          'Access denied. Please signin again to continue.',
      });
      return;
    }

    // 2) VELIFY THE TOKEN (VERIFY AND CHECK TIMESPAN)
    const {
      userInfo: { id },
    } = verifyJWToken(token);

    // 3) CHECK IF USER STILL EXIST
    const currentUser = await User.findById(id);
    if (!currentUser)
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists',
      });

    // 4) Check if user account is active
    if (!currentUser.active)
      return res.status(403).json({
        status: 'fail',
        message:
          'Your account has been temporarily closed! Contact customer support for help.',
      });

    // TODO: USer Changed password resently

    // 5) GRANT ACCESS (AUTHORIZE)
    req.user = currentUser;
    next();
  } catch (error) {
    if (
      error.message === 'jwt malformed, Please login again'
    ) {
      return res.status(401).json({
        status: 'fail',
        message:
          'You are not signed in! Please sign in to continue.',
      });
    }
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error.',
    });
  }
};
