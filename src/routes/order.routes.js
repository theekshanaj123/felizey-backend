const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {
  getOrders,
  getOrdersByOrganizer,
} = require("../controllers/order.controller");

router.get("/getOrders", authenticateToken, getOrders);
router.get("/getOrdersByOrganizer", authenticateToken, getOrdersByOrganizer);

module.exports = router;
