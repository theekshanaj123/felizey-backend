const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {scanTicket, getTicketByEvent, updateStatus, scanTicketByEmailOrMobile, createPaymentSession, bookTicket} = require("../controllers/ticket.controller");


router.get("/qrScan/:code", authenticateToken, scanTicket);
router.get("/getTicketByEvent/:eventId", authenticateToken, getTicketByEvent);
router.post("/qrScanByEmailOrMobile", authenticateToken, scanTicketByEmailOrMobile);
router.post("/createPaymentSession", authenticateToken, createPaymentSession);
router.post("/confirmOrder", authenticateToken, bookTicket);

module.exports = router;