const {check}=require("express-validator")
const validatorMiddleware = require('../middleware/validator');

const createlostValidator=[
    check('name').notEmpty().withMessage("please entre your name").isAlpha().withMessage("please enter valid name")
    ,
    check('email').notEmpty().withMessage("please entre your email").isEmail().withMessage("Invalid email")
    
    ,check('phoneNumber').notEmpty().withMessage("please entre your phone number").matches(/^01[0125][0-9]{8}$/).withMessage("Invalid phone number")
    ,check('address').notEmpty().withMessage("please entre Missing address"),validatorMiddleware
];

const deletelostValidator = [
    check('id').isMongoId().withMessage('Invalid lost id format'),
    validatorMiddleware,
  ];

const updatelostValidator = [
    check('id').isMongoId().withMessage('Invalid lost id format'),
    check('name').notEmpty().withMessage("please entre your name")
    ,
    check('email').notEmpty().withMessage("please entre your email").isEmail().withMessage("Invalid email")
    
    ,check('phoneNumber').notEmpty().withMessage("please entre your phone number").matches(/^01[0125][0-9]{8}$/).withMessage("Invalid phone number")
    ,check('address').notEmpty().withMessage("please entre Missing address"),validatorMiddleware

  ];

module.exports={createlostValidator,deletelostValidator,updatelostValidator}
    