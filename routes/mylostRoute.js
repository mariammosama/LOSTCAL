const express = require("express");
const router = express.Router();
const {addMylost,deleteMylost,search,mylostReq,updateMylostData,matches}=require('../controller/mylostController')
const {uploadArrayOfImages,validateImageCount} = require("../middleware/uploadImages");
const{addMylostValidate,deleteMylostValidator,updateMylostValidator}=require("../validation/mylostValidation")
const {authorized}=require('../middleware/authorization')

router.post('/',authorized ,uploadArrayOfImages(['img']),validateImageCount,addMylostValidate,addMylost)
router.delete('/:id',authorized,deleteMylostValidator,deleteMylost)
router.get('/search',authorized,search)
router.delete('/:id',authorized,deleteMylostValidator,deleteMylost)
router.get('/allMatches',authorized,matches)

router.patch('/:id',authorized,uploadArrayOfImages(['img']),validateImageCount,updateMylostValidator,updateMylostData)
router.get('/',authorized,mylostReq)

module.exports = router;


