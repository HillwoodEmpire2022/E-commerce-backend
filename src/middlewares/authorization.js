export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "Access denied! You are not allowed to perform this operation.",
          403
        )
      );
    }
    next();
  };
};
