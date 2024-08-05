const {addLost,deleteLost,lostReq,updateLostData}=require('../controller/lostController')
const express = require("express");
const router = express.Router();
const {uploadSingleImage}=require('../middleware/uploadImages');

const{createlostValidator,deletelostValidator,updatelostValidator}=require("../validation/lostValidation")
const {authorized}=require('../middleware/authorization')

router.post('/',authorized ,uploadSingleImage('img'),createlostValidator,addLost)
router.delete('/:id',authorized,deletelostValidator,deleteLost)
router.patch('/:id',authorized,uploadSingleImage('img'),updatelostValidator,updateLostData)
router.get('/',authorized,lostReq)


module.exports = router;
