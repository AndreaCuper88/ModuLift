const express = require('express');
const dashboardController = require("../controllers/dashboardAdminController");


const router = express.Router();

// [GET] /api/admin/dashboard/getClienti → Recupera tutti i clienti attivi (solo admin)
router.get(
    '/getClienti',
    dashboardController.getActiveUsers
);

module.exports = router;