const express = require("express");

const router = express.Router();
const postsApi = require("../../../controller/dataAccess/clientController");
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

//route to Authenticate sceret key for jwt creation
router.get("/token/:sk", function (req, res) {
  console.log("router req", req.body);
  postsApi.SecretKeyVerification(req, res);
});

//path for register
router.use("/register", require("./register"));

//path for group
router.use("/group", require("./group"));

module.exports = router;
