const express = require("express");
const { addNewDetails } = require("../controllers/organizer.controller");
const router = express.Router();

router.post("/addNew", addNewDetails);
router.post("/removeOrganizer", removeOrganizerDetails);

module.exports = router;
