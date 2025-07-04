const express = require("express");
const router = express.Router();
const {
  uploadProfileImage,
  uploadEventImage,
  uploadBanners,
} = require("../controllers/upload.controller");
const upload = require("../services/upload");

router.post("/profileImage", upload.single("file"), uploadProfileImage);
router.post("/eventImage", upload.single("file"), uploadEventImage);
router.post("/banner", upload.array("files"), uploadBanners);

module.exports = router;
