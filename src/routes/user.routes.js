const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const { updateUserEmailSend, updateEmail, getUser, updateUser } = require("../controllers/user.controller");

router.get("/updateEmailSend", authenticateToken, updateUserEmailSend);
router.post("/updateEmail", authenticateToken, updateEmail);
router.get("/getUserById", authenticateToken, getUser);
router.post("/updateUserById", authenticateToken, updateUser);

module.exports = router;
