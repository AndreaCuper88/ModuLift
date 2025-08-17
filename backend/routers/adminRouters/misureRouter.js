const express = require('express');
const misureController = require("../../controllers/adminControllers/misureController");

const router = express.Router();

// [POST] /api/admin/misure/createMisura → Upsert misure (solo admin)
router.post(
    '/upsertMisure',
    misureController.upsertMisure
);

// [GET] /api/admin/misure/getEntries/:userId → Recupero misure dell'utente (solo admin)
router.get(
    '/getEntries/:userId',
    misureController.getEntriesByUser
);

module.exports = router;