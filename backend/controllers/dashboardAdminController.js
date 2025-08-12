const Utente = require('../models/userModel');
const Exercise = require('../models/exerciseModel');
const WorkoutPlan = require('../models/planModel');
const mongoose = require('mongoose');

exports.getActiveUsers = async (req, res) => {
    try {
        const clientiCount = await Utente.countDocuments({ruolo: 'cliente', attivo: true});
        res.status(200).json(clientiCount);
    } catch (e) {
        console.error("Errore durante il caricamento degli utenti attivi:", e);
    }
}