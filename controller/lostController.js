const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const ApiError=require('../middleware/apierror')
const lostModel=require('../models/lostModel')
const cloudinary=require('../middleware/cloudinary');
const catchAsync=require('../middleware/catchAsync')
const NodeWebcam = require('node-webcam');




const addLost=catchAsync(async (req, res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
   
    cloudinary.uploader.upload(req.file.path,{ folder: 'lostcal' },async(err,result)=>{
        if(err) {
           console.log(err);
           return  res.status(500).json({
                success:false,
                message:"error uploading image"
           })
        }  
     
            const savedData = await lostModel.create({
                img: result.secure_url,
                publicId: result.public_id,
                name: req.body.name,
                address:req.body.address,
                phoneNumber:req.body.phoneNumber,
                email:req.body.email,
               user:req.user._id
            });
    
            res.status(200).json({
                success: true,
                message: "Uploaded",
                data: savedData
            });
         
    });

})


    const deleteLost=catchAsync(async(req,res,next)=>{
        
          
              const { id } = req.params;
             
              const publicId = await lostModel.findOne({ _id: id });
              
              if (!publicId) {
                next( new ApiError("Missing not found.",404));
              }
          
              await lostModel.findOneAndDelete({ _id: id });
              const removedImg=publicId.publicId
              await cloudinary.uploader.destroy(removedImg);
              
              res.status(200).send("Request deleted successfully.");
            
          
          });
    
    
    
  
          const updateLostData = catchAsync(async (req, res,next) => {

            const {  name, address, email, phoneNumber } = req.body;
           const {id}= req.params;
        
                // Find the existing missing person by ID
                const lostData = await lostModel.findById(id);
                // Check if the missing person exists
        
                if(!lostData){
                    next( new ApiError("Missing not found.",404));
        
                }
                const removedImg=lostData.publicId
                await cloudinary.uploader.destroy(removedImg);
                cloudinary.uploader.upload(req.file.path,{ folder: 'lostcal' },async(err,result)=>{
                    if(err) {
                       console.log(err);
                       next(  new ApiError("error uploading image",500))
                    }        
                const newData=await lostModel.findByIdAndUpdate(id,{
                    name:name,
                    email:email,
                    address:address,
                    phoneNumber:phoneNumber,
                    img:result.secure_url,
                    publicId:result.public_id
                });
        
                res.status(200).json({"newData":newData});
            } );
        })
          
const lostReq= async (req, res, next) => {
    const user = req.user._id
    const findinfo = await lostModel.find({user:user}).maxTime(10000);
    if(! findinfo || findinfo.length===0 ){
      return next(
        new ApiError("lost not found",404)
     );
      }
    const filteredResponse = findinfo.map(item => ({
      name: item.name,
      address: item.address,
      img: item.img,
      phoneNumber: item.phoneNumber,
      email: item.email,
      id:item.id
  }));
  
    if (findinfo && findinfo.length > 0) 
    return res.json({"result":filteredResponse})

   
  };
  
  
  module.exports={addLost,deleteLost,updateLostData,lostReq}

