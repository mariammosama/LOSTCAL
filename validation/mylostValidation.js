const {check}=require("express-validator")
const validatorMiddleware = require('../middleware/validator');

const addMylostValidate=[
    check('name').notEmpty().withMessage("Please entre your name"),
    check('email').notEmpty().withMessage("Please entre your email").isEmail().withMessage("Invalid email"),
    check('age').isNumeric().withMessage("Please enter valid age").notEmpty().withMessage("Please enter missing age")    
    ,check('phoneNumber').notEmpty().withMessage("Please entre your phone number").matches(/^01[0125][0-9]{8}$/).withMessage("Invalid phone number")
    ,check('address').notEmpty().withMessage("Please entre your address"),validatorMiddleware
];
const deleteMylostValidator = [
    check('id').isMongoId().withMessage('Invalid lost id format'),
    validatorMiddleware,
  ];

const updateMylostValidator = [
    check('id').isMongoId().withMessage('Invalid lost id format'),

    check('name').notEmpty().withMessage("Please entre your name"),
    check('age').notEmpty().withMessage("Please entre missing age").isNumeric().withMessage("Please enter missing age"),

    check('email').notEmpty().withMessage("Please entre your email").isEmail().withMessage("Invalid email")
        
    ,check('phoneNumber').notEmpty().withMessage("Please entre your phone number").matches(/^01[0125][0-9]{8}$/).withMessage("Invalid phone number")
    ,check('address').notEmpty().withMessage("Please entre your address"),
    validatorMiddleware
  ];

module.exports={addMylostValidate,deleteMylostValidator,updateMylostValidator}
    