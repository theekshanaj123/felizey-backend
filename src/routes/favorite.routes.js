const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const { addFavorite, deleteFavorite, getFavoritesByUser } = require("../controllers/favorite.controller");

router.post("/addFavorite", authenticateToken, addFavorite);
router.get("/deleteFavorite/:id", authenticateToken, deleteFavorite);
router.get("/getUserFavorite/:user_id", authenticateToken, getFavoritesByUser);

module.exports = router;
