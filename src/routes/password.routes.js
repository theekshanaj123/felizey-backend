const express = require('express');
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const { sendPasswordResetEmail, passwordReset } = require('../controllers/password.controller');

router.get('/resetMail',authenticateToken , sendPasswordResetEmail);
router.post('/reset', authenticateToken , passwordReset);

module.exports = router;
