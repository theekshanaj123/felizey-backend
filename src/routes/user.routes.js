const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {
  updateUserEmailSend,
  updateEmail,
  getUser,
  updateUser,
  getUserByToken,
  deleteUserById,
  addNewRole,
  getUserRoleByEventId,
  getAllRoleByEventId,
  removeUserRoleByEventId,
  getUserRolls,
} = require("../controllers/user.controller");

router.get("/updateEmailSend", authenticateToken, updateUserEmailSend);
router.get("/getUserById", authenticateToken, getUser);
router.get("/getUser", authenticateToken, getUserByToken);
router.get("/deleteUser", authenticateToken, deleteUserById);
router.get("/getAllRolesByEventId/:eventId", getAllRoleByEventId);
router.get("/getUserRolls", authenticateToken, getUserRolls);
router.post("/updateEmail", authenticateToken, updateEmail);
router.post("/updateUserById", authenticateToken, updateUser);
router.post("/addNewRole", authenticateToken, addNewRole);
router.post("/acceptRole", authenticateToken, acceptRoll);
router.post("/declineRole", authenticateToken, declineRoll);
router.post("/getUserRoleByEventId", authenticateToken, getUserRoleByEventId);
router.post(
  "/deleteUserRoleByEvent",
  authenticateToken,
  removeUserRoleByEventId
);

module.exports = router;
