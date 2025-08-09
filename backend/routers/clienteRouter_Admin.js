const express = require('express');
const clienteController = require("../controllers/clienteController_Admin");
const verifyToken = require('../middlewares/verifyToken');       // se già creato
//const requireRoles = require('../middlewares/requireRoles');     // es: requireRoles('admin')

const router = express.Router();

// [GET] /api/clienti/getClienti → Recupera tutti i clienti (solo admin)
router.get(
    '/getClienti',
    verifyToken,
    //requireRoles('admin'),
    clienteController.getClienti
);

// [PATCH] /api/clienti/:id/disable → Disattiva un cliente (attivo = false)
//Patch serve per aggiornare parzialmente una risorsa, invio solo i campi che voglio modificare
router.patch(
    '/:id/disable',
    //verifyToken,
    //requireRoles('admin'),
    clienteController.disableCliente
);

// [PATCH] Riattiva cliente (attivo=true)
router.patch(
    '/:id/enable',
    verifyToken,
    //requireRoles('admin'),
    clienteController.enableCliente
);

// [DELETE] /api/clienti/:id/delete → Elimina definitivamente un cliente
router.delete(
    '/:id/delete',
    //verifyToken,
    //requireRoles('admin'),
    clienteController.deleteCliente
);

module.exports = router;
