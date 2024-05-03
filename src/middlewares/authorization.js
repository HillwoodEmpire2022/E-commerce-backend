export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message:
          'Access denied! You are not allowed to perform this operation.',
      });
    }
    next();
  };
};
