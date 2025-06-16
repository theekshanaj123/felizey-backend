const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {scanTicket, getTicketByEvent} = require("../controllers/ticket.controller");


router.get("/qrScan/:code", authenticateToken, scanTicket);
router.get("/getTicketByEvent/:eventId", authenticateToken, getTicketByEvent);

module.exports = router;