const express = require('express');
const dashboardController = require("../../controllers/adminControllers/dashboardAdminController");


const router = express.Router();

// [GET] /api/admin/dashboard/getClienti → Recupera tutti i clienti attivi (solo admin)
router.get(
    '/getClienti',
    dashboardController.getActiveUsers
);

// [GET] /api/admin/dashboard/getCountPiani → Recupera tutti piani creati durante la settimana corrente e li conta (solo admin)
router.get(
    '/getCountPiani',
    dashboardController.getCountPiani
);

// [GET] /api/admin/dashboard/getCountSchede → Conta tutte le schede di allenamento (solo admin)
router.get(
    '/getCountSchede',
    dashboardController.getCountSchede
);

// [GET] /api/admin/dashboard/getCountPianiAlimentari → Conta tutti i piani alimentari (solo admin)
router.get(
    '/getCountPianiAlimentari',
    dashboardController.getCountPianiAlimentari
);

module.exports = router;