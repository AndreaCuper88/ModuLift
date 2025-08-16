const express = require('express');
const misureController = require("../controllers/misureController");

const router = express.Router();

// [POST] /api/admin/misure/createMisura → Recupera un cliente (solo admin)
router.post(
    '/createMisura',
    misureController.createMisura
);

module.exports = router;