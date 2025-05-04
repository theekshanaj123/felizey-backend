const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {createOrder} = require("../controllers/order.controller");


router.post("/create-checkout-session", authenticateToken, createOrder);
router.post("/webhook",express.raw({ type: 'application/json' }), createOrder);

module.exports = router;