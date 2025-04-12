const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const { updateUserEmailSend, updateEmail, getUser } = require("../controllers/user.controller");

router.get("/updateEmailSend", authenticateToken, updateUserEmailSend);
router.post("/updateEmail", authenticateToken, updateEmail);
router.get("/getUserById", authenticateToken, getUser);

module.exports = router;
