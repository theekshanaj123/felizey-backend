const express = require("express");
const { checkEvent } = require("../controllers/cron.controller");
const router = express.Router();

router.get("/checkEvent", checkEvent);

module.exports = router;
