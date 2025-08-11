const Utente = require('../models/userModel');
const Exercise = require('../models/exerciseSchema');
const mongoose = require('mongoose');


// [GET] /api/editorSchede/getCliente
exports.getCliente = async (req, res) => {
    try {
        const {id} = req.params;
        const cliente = await Utente.findOne({_id: id}).select("nome cognome avatarPath email");
        if (!cliente) {
            return res.status(404).json({errore: 'Cliente non trovato'});
        }
        res.status(200).json(cliente);
    } catch (e) {
        console.error("Errore durante il caricamento dei clienti: ",e);
        res.status(500).json({ errore: "Errore interno del server" });
    }
}

// [GET] /api/editorSchede/getExercises
exports.getExercises = async (req, res) => {
    try {
        const exercises = await Exercise.find({});
        if (!exercises) {
            return res.status(404).json({errore: 'Nessun esercizio trovato'});
        }
        res.status(200).json(exercises);
    } catch (e) {
        console.error("Errore durante il caricamento degli esercizi: ",e);
        res.status(500).json({ errore: "Errore interno del server" });
    }
}

exports.createExercise = async (req, res) => {
    try {
        const { name, muscle, imagePath } = req.body;

        if (!name || !muscle || !imagePath) {
            return res.status(400).json({ errore: 'name, muscle, imagePath sono obbligatori' });
        }

        const doc = await Exercise.create({ name, muscle, imagePath });
        return res.status(201).json(doc);
    } catch (e) {
        console.error('Errore createExercise:', e);
        // Se l'errore è di validazione Mongoose (es. enum muscle)
        if (e.name === 'ValidationError') {
            return res.status(400).json({ errore: e.message });
        }
        return res.status(500).json({ errore: 'Errore interno del server' });
    }
};

exports.removeExercise = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID esercizio mancante" });
        }
        const deleted = await Exercise.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Esercizio non trovato" });
        }
        return res.status(200).json({
            message: "Esercizio eliminato con successo",
            deleted
        });
    } catch (e) {
        console.error("Errore durante la rimozione dell'esercizio: ",e);
        res.status(500).json({ errore: "Errore interno del server" });
    }
}