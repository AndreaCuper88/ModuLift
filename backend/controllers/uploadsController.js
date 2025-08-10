const Exercise = require('../models/exerciseSchema');
const mongoose = require('mongoose');

exports.uploadExerciseImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({errore: "Nessun file caricato"})
        }

        res.status(200).json({
            message: "Upload completato",
            filename: req.file.filename,
            path: req.file.path,
        });
    } catch (err) {
        console.log("Errore durante l'upload: ",err);
        return res.status(500).json({errore: "Errore l'upload: ",err});
    }
}