import { verifyJWToken } from "../utils/jsonWebToken.js";

// Protect
export const isLoggedIn = async (req, res, next) => {
  try {
    let token;

    // 1) GET THE TOKEN AND CHECK IF IT EXIST
    if (req.headers.authorization)
      token = req.headers.authorization.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Access denied. Please login again." });
      return;
    }

    // 2) VELIFY THE TOKEN (VERIFY AND CHECK TIMESPAN)
    const { id } = verifyJWToken(token);

    // 3) CHECK IF USER STILL EXIST
    const currentUser = await User.findById({ _id: id });
    if (!currentUser) return next(new AppError("User no longer exists", 401));

    // 5) GRANT ACCESS (AUTHORIZE)
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(5000).json({
      status: "fail",
      message: error.message,
    });
  }
};
