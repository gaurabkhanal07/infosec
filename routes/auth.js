const express = require('express');
const { register, login, verifyPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify', verifyPassword);

module.exports = router;
