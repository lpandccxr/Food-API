const express = require("express");
const router = express.Router();

const foodeController = require("../controllers/food-controller");

router.route("/random/:username").get(foodeController.random);

module.exports = router;
