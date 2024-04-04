const express = require("express");
const router = express.Router();

const userController = require("../controllers/user-controller");

router.route("/signup").post(userController.signUp);

router.route("/login").post(userController.logIn);

router.route("/check-username/:username").get(userController.checkUsername);

router.route("/check-email/:email").get(userController.checkEmail);

router.get("/profile", userController.authenToken, userController.getUserInfo);

router.put("/add-record", userController.authenToken, userController.addRecord);

router.put("/add-food", userController.authenToken, userController.addFood);

router.delete(
  "/unlike-food/:name",
  userController.authenToken,
  userController.unlikeFood
);

module.exports = router;
