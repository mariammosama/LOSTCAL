const { validationResult } = require('express-validator');
const bcrypt=require('bcrypt')
const ApiError=require('../middleware/apierror')
const usermodel=require('../models/userModel')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler');
const catchAsync = require('../middleware/catchAsync');
const Email = require('../middleware/email');
const crypto= require('crypto');
const BlacklistModel=require( '../models/blacklistModel.js');

const env=require("dotenv")
env.config({path:'config.env'})

const signToken = id => {
  return jwt.sign({ id },
     process.env.SECRETKEY, {
    expiresIn: process.env.EXPIRETIME
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expire: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  user.passwordConfirm = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};
const signup =catchAsync( async (req, res,next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const {username, email, password ,passwordConfirm } = req.body;
        
        const newuser = await usermodel.create({
           username,
            email,
          password,
          passwordConfirm
        });
      
  const url = `${req.protocol}://${req.get('host')}api/user/profile`;
  // console.log(url);
  await new Email(newuser, url).sendWelcome();

           createSendToken(newuser, 200, res);
      
  });

const login=catchAsync(async(req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { email, password } = req.body;
    const finduser = await usermodel.findOne({email}).select('+password');
    
    if (!finduser || !(await finduser.correctPassword(password, finduser.password))) {
      return next(new ApiError('Incorrect email or password', 401));
    }
  
    createSendToken(finduser, 200, res);

  

  });

  const myinfo=catchAsync( async (req, res, next) => {
    const user = req.user._id
    console.log(user)
    const findinfo = await usermodel.findOne({_id:user});
    
    if (findinfo) 
    return res.json({"username":findinfo.username , "email":findinfo.email,"_id":findinfo.id});
   console.log(findinfo)
    return next(
       new ApiError("user not found",404)
    );
  });
 const changeName=catchAsync(async(req,res,next)=>{
  const id=req.user._id;
  const user =await usermodel.findById(id);
  if(!user){
    return next(
      new ApiError("user not found",404)
   );
  }
  const { username } = req.body;
  const updatproduct = await usermodel.findByIdAndUpdate(id,{username} );
  res.status(200).send("updated username sucessfully")

 })
 const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await usermodel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError('There is no user with email address.', 404));
  }

  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  // 3) Send it to user's email
 

  try {
    
    await new Email(user, resetCode).sendPasswordReset();


    res.status(200).json({
      status: 'success',
      message: 'Reset code sent to email'
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError('There is an error in sending email', 500));
  }

  
});
const verifyPassResetCode = catchAsync(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const user = await usermodel.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError('Reset code invalid or expired'));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: 'Success',
  });
});
const resetPassword = catchAsync(async (req, res, next) => {
 
  const user = await usermodel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError('Reset code not verified', 400));
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

 
  createSendToken(user, 200, res);

});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await usermodel.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new ApiError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

const logout = async(req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
   
    if (!token) return res.sendStatus(204); // No content
    
    const checkIfBlacklisted = await BlacklistModel.findOne({ token: token }); // Check if that token is blacklisted
    // if true, send a no content response.
    if (checkIfBlacklisted) return res.sendStatus(204);
    // otherwise blacklist token
    const newBlacklist = new BlacklistModel({
      token: token,
    });
    await newBlacklist.save();
    // Also clear request cookie on client
    res.setHeader('Clear-Site-Data', '"cookies"');
    res.status(200).json({ message: 'You are logged out!' });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
  res.end();
};
  module.exports={signup,login,myinfo,changeName,forgotPassword,resetPassword,updatePassword,logout,verifyPassResetCode}