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

// [POST] /api/editorSchede/upsertPlan → Upsert del piano, modifico o aggiorno se necessario (solo admin)
router.post(
    '/upsertPlan',
    verifyToken,
    requireRoles('admin'),
    editorController.setPlan
);

// [GET] /api/editorSchede/loadPlan → Recupero il piano attivo più recente dell'utente (solo admin)
router.get(
    '/loadPlan/:userId',
    verifyToken,
    requireRoles('admin'),
    editorController.loadPlan
)

module.exports = router;