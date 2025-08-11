const express = require('express');
const editorController = require("../controllers/editorSchedeController");
const verifyToken = require('../middlewares/verifyToken');
const requireRoles = require('../middlewares/requireRoles');

const router = express.Router();

// [GET] /api/editorSchede/getCliente/:id → Recupera un cliente (solo admin)
router.get(
    '/getCliente/:id',
    verifyToken,
    requireRoles('admin'),
    editorController.getCliente
);

// [GET] /api/editorSchede/getExercises → Recupera la lista degli esercizi memorizzati (solo admin)
router.get(
    '/getExercises',
    verifyToken,
    requireRoles('admin'),
    editorController.getExercises
);

// [POST] /api/editorSchede/createExercise → Creazione nuovo esercizio (solo admin)
router.post(
    '/createExercise',
    verifyToken,
    requireRoles('admin'),
    editorController.createExercise
);

// [DELETE] /api/editorSchede/removeExercise → Rimozione di un esercizio (solo admin)
router.delete(
    '/removeExercise/:id',
    verifyToken,
    requireRoles('admin'),
    editorController.removeExercise
);

module.exports = router;