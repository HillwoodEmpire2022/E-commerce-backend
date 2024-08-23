export default function globalErrorHandler(err, req, res, next) {
  // if (process.env.NODE_ENV !== 'test') console.log('🔥Error: ', err);
  console.log('*********************************************', err?.data);
  // console.log('*********************************************', err?.response?.data);

  // JWT Errors
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

  //  Handle Exptected Errors (Errors that we created with the AppError class)
  if (err.statusCode >= 400 && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  // Unexpected Errors
  res.status(500).json({
    status: 'error',
    message: 'Internal server error! Please try again later.',
  });
}
