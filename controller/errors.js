const ApiError = require('../middleware/apierror');

const handleJWTError = () =>
  new ApiError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new ApiError('Your token has expired! Please log in again.', 401);

  const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
  
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new ApiError(message, 400);
  };

const sendErrorDev = (err,req ,res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

  const sendErrorProd = (err,req, res) => {
    // Operational, trusted error: send message to client
    
    if (err.isOperational) {
      
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
  
      // Programming or other unknown error: don't leak error details
    } else {
      // 1) Log error
      console.error('ERROR ', err);
  
      // 2) Send generic message
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });
    }
    
  };
module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
    if (err.name === 'ValidationError')
    err = handleValidationErrorDB(err);
    sendErrorProd(err, req, res);
  }
  next()
};
