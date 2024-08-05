const  mongoose  = require("mongoose");
const Blacklistschema = mongoose.Schema({
    token: {
        type: String,
        required: true,

        
    },
},
{ timestamps: true }
     

);

  Blacklist=mongoose.model('Blacklist',Blacklistschema);
  module.exports=Blacklist;
