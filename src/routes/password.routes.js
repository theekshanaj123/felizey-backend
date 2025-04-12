const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {
  sendPasswordResetEmail,
  passwordReset,
} = require("../controllers/password.controller");

router.post("/resetMail", sendPasswordResetEmail);
router.post("/reset", passwordReset);

module.exports = router;
