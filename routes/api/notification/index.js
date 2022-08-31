const express = require("express");

const router = express.Router();
const postsApi = require("../../../controller/dataAccess/notificationController");
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

//route to send notifications
router.post("/", function (req, res) {
  console.log("router req", req.body);
  postsApi.sendNotification(req, res);
});

module.exports = router;
