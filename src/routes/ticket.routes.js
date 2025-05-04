const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {scanTicket} = require("../controllers/ticket.controller");


router.get("/qrScan/:code", authenticateToken, scanTicket);

module.exports = router;