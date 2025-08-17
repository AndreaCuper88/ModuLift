const express = require('express');
const clienteController = require("../../controllers/adminControllers/clienteController_Admin");

const router = express.Router();

// [GET] /api/clienti/getClienti → Recupera tutti i clienti (solo admin)
router.get(
    '/getClienti',
    clienteController.getClienti
);

// [PATCH] /api/clienti/:id/disable → Disattiva un cliente (attivo = false)
//Patch serve per aggiornare parzialmente una risorsa, invio solo i campi che voglio modificare
router.patch(
    '/:id/disable',
    clienteController.disableCliente
);

// [PATCH] Riattiva cliente (attivo=true)
router.patch(
    '/:id/enable',
    clienteController.enableCliente
);

// [DELETE] /api/clienti/:id/delete → Elimina definitivamente un cliente
router.delete(
    '/:id/delete',
    clienteController.deleteCliente
);

module.exports = router;
