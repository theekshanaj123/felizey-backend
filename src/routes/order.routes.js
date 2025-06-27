const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {createOrder, getOrders} = require("../controllers/order.controller");


// router.post("/create-checkout-session", authenticateToken, createOrder);
router.get("/getOrders", authenticateToken, getOrders);

module.exports = router;