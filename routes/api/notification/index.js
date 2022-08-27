const express = require('express');

const router = express.Router();
const postsApi = require("../../../controller/data_access/notification_controller");
router.use(express.json());
router.use(express.urlencoded({extended:false}));

 //route to create user entity
 router.post('/',function(req,res){
    console.log('router req',req.body)
    postsApi.sendNotification(req,res);
  });

  module.exports = router;