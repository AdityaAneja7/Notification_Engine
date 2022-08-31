const express = require("express");

const router = express.Router();
const postsApi = require("../../../controller/dataAccess/clientController");
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

//route to create group
router.post("/create", function (req, res) {
  console.log("router req", req.body);
  postsApi.createGroup(req, res);
});

router.post("/allot", function (req, res) {
  console.log("router req", req.body);
  postsApi.allotGroup(req, res);
});


module.exports = router;