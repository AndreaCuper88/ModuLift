const express = require('express');
const uploadsController = require("../controllers/uploadsController");
const verifyToken = require('../middlewares/verifyToken');
const requireRoles = require('../middlewares/requireRoles');
const multer = require('multer');
const path = require('path');

const router = express.Router();

//Configurazione di Multer (per fare upload nelle cartelle del backend)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const muscle = req.body.muscle
        cb(null, path.join(__dirname,`../uploads/exercises/${muscle}`));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); //Mantengo il nome originale
    }
});

const upload = multer({storage: storage});

// [POST] /api/uploads/uploadExerciseImage → Creazione nuovo esercizio (solo admin)
router.post(
    '/uploadExerciseImage',
    verifyToken,
    requireRoles('admin'),
    upload.single('file'),
    uploadsController.uploadExerciseImage
);

module.exports = router;