const express = require('express');

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({extended:false}));

router.use('/client', require('./client'));

router.use('/user', require('./user'));

router.use('/notification', require('./notification'));




module.exports = router;