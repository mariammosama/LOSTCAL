const jwt = require('jsonwebtoken');
const util = require('util');
const ApiError = require('./apierror');
const User = require('../models/userModel');
const catchAsync = require('../middleware/catchAsync');

const authorized = catchAsync(async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    // Log the token for debugging
    console.log('JWT:', token);
    const checkIfBlacklisted = await Blacklist.findOne({ token: token }); // Check if that token is blacklisted

    if (!token || checkIfBlacklisted) {
      return next(new ApiError('You are not logged in. Please log in to get access.', 401));
    }

    // Verify token
    const decoded = await util.promisify(jwt.verify)(token, process.env.secretkey);
    console.log('Decoded JWT:', decoded);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    console.log('Current User:', currentUser);

    if (!currentUser) {
      return next(new ApiError('The user belonging to this token does no longer exist.', 401));
    }

    // Check if user changed password after token was issued
    if (currentUser.passwordChangedAt) {
      const passChangedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
      if (passChangedTimestamp > decoded.iat) {
        return next(new ApiError('User recently changed password. Please log in again.', 401));
      }
    }

    req.user = currentUser;
    next();
  } catch (err) {
    console.error('Error in authorization middleware:', err);
    return next(new ApiError('Authorization failed. Please try again.', 401));
  }
});

module.exports = { authorized };
