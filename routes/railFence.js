const express = require('express');
const { encryptRailFence, decryptRailFence } = require('../controllers/railFenceController');

const router = express.Router();

router.post('/encrypt', encryptRailFence);
router.post('/decrypt', decryptRailFence);

module.exports = router;
