const express = require('express');

const router = express.Router();
const postsApi = require("../../../controller/data_access/client_controller");
router.use(express.json());
router.use(express.urlencoded({extended:false}));

 //route to Authenticate sceret key for jwt creation
 router.get('/:sk',function(req,res){
    console.log('router req',req.body)
    postsApi.SecretKeyVerification(req,res);
  });




router.use('/register', require('./register'));
router.use('/group', require('./group'));

module.exports = router;