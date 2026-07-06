const express = require('express');
const { generateKeys, encryptMessage, decryptCiphertext } = require('../controllers/rsaController');

const router = express.Router();

router.post('/generate', generateKeys);
router.post('/encrypt', encryptMessage);
router.post('/decrypt', decryptCiphertext);

module.exports = router;
