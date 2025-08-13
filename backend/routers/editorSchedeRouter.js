const express = require('express');
const editorController = require("../controllers/editorSchedeController");

const router = express.Router();

// [GET] /api/editorSchede/getExercises → Recupera la lista degli esercizi memorizzati (solo admin)
router.get(
    '/getExercises',
    editorController.getExercises
);

// [POST] /api/editorSchede/createExercise → Creazione nuovo esercizio (solo admin)
router.post(
    '/createExercise',
    editorController.createExercise
);

// [DELETE] /api/editorSchede/removeExercise → Rimozione di un esercizio (solo admin)
router.delete(
    '/removeExercise/:id',
    editorController.removeExercise
);

// [POST] /api/editorSchede/upsertPlan → Upsert del piano, modifico o aggiorno se necessario (solo admin)
router.post(
    '/upsertPlan',
    editorController.setPlan
);

// [GET] /api/editorSchede/loadPlan → Recupero il piano attivo più recente dell'utente (solo admin)
router.get(
    '/loadPlan/:userId',
    editorController.loadPlan
)

module.exports = router;