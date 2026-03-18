const express = require('express');
const piano = require('../../controllers/clienteControllers/pianoalimentareController');

const router = express.Router();

// SOLO utente autenticato
router.get("/latest", piano.getLatestPiano);

module.exports = router;