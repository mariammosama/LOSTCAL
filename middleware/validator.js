const { validationResult } = require('express-validator');

const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (process.env.NODE_ENV === 'development') {
      // In development mode, return array of errors
      return res.status(400).json({ errors: errors.array() });
    } else if (process.env.NODE_ENV === 'production') {
      // In production mode, return error message and value
      const errorMessages = errors.array().map(error => ({
        msg: error.msg,
     //   value: error.value
      }));
      return res.status(400).json({ errors: errorMessages });
    }
  }
  next();
};

module.exports = validatorMiddleware;
