const express = require('express');
const pianoAlimentare = require("../../controllers/adminControllers/pianoAlimentareController");

const router = express.Router();

// [POST] /api/admin/pianoAlimentare/createPiano → Creo un piano alimentare (solo admin)
router.post(
    '/createPiano',
    pianoAlimentare.createOrUpdateLatestPiano
);

// [GET] /api/admin/pianoAlimentare/getLatestPiano → Carico il piano più recente dell'utente (solo admin)
router.get(
    '/getLatestPiano',
    pianoAlimentare.getLatestPiano
)

module.exports = router;