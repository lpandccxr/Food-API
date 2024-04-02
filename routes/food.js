const express = require("express");
const router = express.Router();

const foodeController = require("../controllers/food-controller");

router.get("/random", foodeController.random);

module.exports = router;
