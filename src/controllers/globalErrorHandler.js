export default function globalErrorHandler(
  err,
  req,
  res,
  next
) {
  console.error('🔥Error: ', err);

  if (err.statusCode >= 400 && err.statusCode < 500) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: `Authentication session expired. Please signin to continue.`,
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: `Invalid authentication token. Please signin to continue.`,
      });
    }

    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  res.status(500).json({
    status: 'error',
    message:
      'Internal server error! Please try again later.',
  });
}
