const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {requsetSend} = require("../controllers/member.controller");


router.post("/requestSend", authenticateToken, requsetSend);

module.exports = router;