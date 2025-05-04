const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const { updateUserEmailSend, updateEmail, getUser, updateUser, getUserByToken} = require("../controllers/user.controller");



router.get("/updateEmailSend", authenticateToken, updateUserEmailSend);
router.post("/updateEmail", authenticateToken, updateEmail);
router.get("/getUserById", authenticateToken, getUser);
router.get("/getUser", authenticateToken, getUserByToken);
router.post("/updateUserById", authenticateToken, updateUser);

module.exports = router;
