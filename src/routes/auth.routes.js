const express = require("express");
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  checkOTP,
  appleLogin,
  saveNotifyTocken,
} = require("../controllers/auth.controller");
const authenticateToken = require("../middleware/authenticateToken");

router.post("/register", register);
router.post("/verifyOTP", checkOTP);
router.post("/login", login);
router.post("/googleLogin", googleLogin);
router.post("/appleLogin", appleLogin);
router.post("/saveNotifyTocken", saveNotifyTocken);

module.exports = router;
