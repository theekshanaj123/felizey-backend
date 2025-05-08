const express = require("express");
const router = express.Router();

router.get("/checkEvent", createEvent);

module.exports = router;
