// routers/trainingRouter.js
const express = require('express');
const training = require('../../controllers/clienteControllers/trainingController');

const router = express.Router();

// Recupera piano per ID (parametro nel path), /api/cliente/workout/plan/:planId
router.get('/plan/:planId', training.getWorkoutPlanFull);

router.put('/upsert/:planId/:dayId', training.upsertDayEntries);

router.get('/last-workout', training.getLastWorkout);

//router.get("/:planId/todayLogs", training.getTodayLogs);


module.exports = router;
