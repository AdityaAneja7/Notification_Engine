const express = require("express");

const router = express.Router();
const homeController = require("../controller/home_controller");
const notificationApi = require("../services/pushNotification_Service");

console.log("Router loaded");

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.use("/api", require("./api"));

//route to push notification to provided device id of user
router.post("/fcm", function (req, res) {
  notificationApi.pushNotification(req, res);
});

// router.get('/',homeController.home);
// router.use('/users',require('./users'));

module.exports = router;
