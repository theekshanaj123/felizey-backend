const express = require("express");
const router = express.Router();
const {
  register,
  login,
  loginWithProvider,
  handleCallback,
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);

module.exports = router;
