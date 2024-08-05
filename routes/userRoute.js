const {signup,login,myinfo,changeName,forgotPassword,resetPassword,updatePassword,logout,verifyPassResetCode}=require('../controller/userController')
const express = require("express");
const router = express.Router();
const {signupValidate,loginValidate,changeNameValidator,resetPassValidator,forgetPasswordValidator,updateMyPasswordValidator}=require('../validation/userValidate')
const {authorized}=require('../middleware/authorization')



router.post('/signup',signupValidate,signup)
router.post('/login',loginValidate,login)
router.get('/profile',authorized,myinfo)
router.patch('/changename',authorized,changeNameValidator,changeName)

router.post('/forgetPassword',forgetPasswordValidator,forgotPassword)
router.post('/verifyResetCode', verifyPassResetCode);
router.put('/resetPassword',resetPassValidator,resetPassword)

router.patch('/updateMyPassword',authorized,updateMyPasswordValidator,updatePassword)
router.get('/logout', logout);


module.exports = router;
