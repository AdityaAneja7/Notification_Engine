const express = require("express");

const router = express.Router();
const homeController = require("../controller/homeController");
const notificationApi = require("../services/pushNotification_Service");

console.log("Router loaded");
//convert received data to JSON
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

//path to api
router.use("/api", require("./api"));


module.exports = router;
