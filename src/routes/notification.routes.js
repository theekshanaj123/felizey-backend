const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const { pushNotification } = require("../controllers/notification.controller");

router.post("/pushNotification", authenticateToken, pushNotification);

module.exports = router;
