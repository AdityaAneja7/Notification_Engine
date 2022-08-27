
const express = require('express');

const router = express.Router();
const postsApi = require("../../../controller/data_access/client_controller");
router.use(express.json());
router.use(express.urlencoded({extended:false}));


//route to create secret key for unique user
router.post('/create',function(req,res){
    console.log('router req',req.body)
    postsApi.createGroup(req,res);
  });

module.exports = router;