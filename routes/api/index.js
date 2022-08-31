const express = require("express");

const router = express.Router();
//convert received data to json
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

//path to client
router.use("/client", require("./client"));
//path to user
router.use("/user", require("./user"));
//path to notification
router.use("/notification", require("./notification"));

module.exports = router;
