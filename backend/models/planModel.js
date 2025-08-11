const mongoose = require('mongoose');

const planModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utente',
        required: true
    },
    weeks: {
        type: Number,
        required: true,
        min: 1
    },
    plan: { type: mongoose.Schema.Types.Mixed, default: {} } //Per risolvere errori sulla mappa chave valore, non aggiornava i valori interni
}, { timestamps: true }); //Aggiungo automaticamente createdAt e updatedAt

module.exports = mongoose.model('WorkoutPlan', planModel);