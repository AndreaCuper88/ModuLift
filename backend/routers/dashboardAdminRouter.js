const express = require('express');
const dashboardController = require("../controllers/dashboardAdminController");


const router = express.Router();

// [GET] /api//getClienti → Recupera tutti i clienti (solo admin)
router.get(
    '/getClienti',
    dashboardController.getActiveUsers
);

module.exports = router;