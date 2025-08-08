const express = require('express');
const clienteController = require("../controllers/clienteController_Admin");
const router = express.Router();

// Rotta GET /api/clienti/getClienti → Recupera tutti i clienti
router.get('/getClienti', clienteController.getClienti);

module.exports = router;