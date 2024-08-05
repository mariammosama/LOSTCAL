const  mongoose  = require("mongoose");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const utli = require('util');
const asyncsign = utli.promisify(jwt.sign)
const crypto = require('crypto');

const schema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength:4
    },
    email: {
        type: String,
        required: true,
        unique:true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        minLength:6,
        match:[/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,15}$/,'Please fill a valid password'],  //special/number/capital
        select:false, 
    },
    passwordConfirm: {
        type: String,
    },    
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    isAdmin:{
        type:Boolean,
        default:false,
    },

},{ timestamps: true });

schema.pre("save",async function(next){
    if (this.isModified('password')) {
        const saltpass=15;
        const hashpass= await bcrypt.hash(this.password, saltpass)
        this.password = hashpass
    }
    this.passwordConfirm = undefined;

    next();
})
schema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });
  schema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };
  
schema.methods.generateToken = function () {
    const token = asyncsign({
      id: this.id,
      email: this.email,
      isAdmin: this.isAdmin
   
    }, process.env.secretkey)
    return token
  }
 
  
  userShema=mongoose.model('users',schema);
  module.exports=userShema;
