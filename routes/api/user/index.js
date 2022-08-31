const express = require("express");

const router = express.Router();
const postsApi = require("../../../controller/dataAccess/userController");
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

//route to create user entity
router.post("/create", function (req, res) {
  console.log("router req", req.body);
  postsApi.createUser(req, res);
});

//route to search user entity
router.get("/:id", function (req, res) {
  console.log("router req", req.body);
  postsApi.searchUser(req, res);
});

//route to update user entity
router.post("/update", function (req, res) {
  console.log("router req", req.body);
  postsApi.updateUser(req, res);
});

//route to delete user entity
router.get("/delete/:Id", function (req, res) {
  console.log("router req", req.body);
  postsApi.deleteEntity(req, res);
});

module.exports = router;
