const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const { updateUserEmailSend, updateEmail, getUser, updateUser, getUserByToken, deleteUserById, addNewRole,
    getUserRoleByEventId, getAllRoleByEventId
} = require("../controllers/user.controller");



router.get("/updateEmailSend", authenticateToken, updateUserEmailSend);
router.get("/getUserById", authenticateToken, getUser);
router.get("/getUser", authenticateToken, getUserByToken);
router.get("/deleteUser", authenticateToken, deleteUserById);
router.get("/getUserRolesByEventId/:event_id", authenticateToken, getAllRoleByEventId);
router.post("/updateEmail", authenticateToken, updateEmail);
router.post("/updateUserById", authenticateToken, updateUser);
router.post("/addNewroll", authenticateToken, addNewRole);
router.post("/getAllUserRolesByEventId", authenticateToken, getUserRoleByEventId);

module.exports = router;
