const express = require("express");

const router = express.Router();
const postsApi = require("../../../controller/dataAccess/clientController");
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

//route to create secret key for unique user
router.post("/", function (req, res) {
  console.log("router req", req.body);
  postsApi.secretKey(req, res);
});

module.exports = router;
