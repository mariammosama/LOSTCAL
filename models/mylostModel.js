const  mongoose  = require("mongoose");

const mylostSchema = mongoose.Schema({
  name:{
    type:String,
    trim:true,
  },

  img:{
    type:[String],
  },
  publicId:{
   type:[String]
  },
  address:{
    type:String
  },
  age:{
    type:Number
  },
  email: {
    type: String,
    required: true,
     match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
},
phoneNumber:{
  type:Number,
  match:[/^01[0125][0-9]{8}$/,'phone number not correct']

},
user: {
  type: mongoose.Schema.ObjectId,
  ref: 'users',
},
     

},{ timestamps: true });

  mylostSchema.index({ name: 1 });
  
  missingPepole=mongoose.model('missingPepole',mylostSchema);
  module.exports=missingPepole;
