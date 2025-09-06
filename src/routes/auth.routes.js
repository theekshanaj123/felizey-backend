const express = require("express");
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  checkOTP,
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/verifyOTP", checkOTP);
router.post("/login", login);
router.post("/googleLogin", googleLogin);

module.exports = router;
