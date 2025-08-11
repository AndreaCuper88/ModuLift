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
    plan: {
        type: Map,  //Mappa chiave-valore, indico i tipi dei valori che saranno assegnati ad ogni chiave
        of: [{
            uid: { type: String, required: true },
            exerciseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Exercise',
                required: true
            },
            scheme: [{
                count: { type: Number, required: true },
                reps: { type: Number, required: true }
            }],
            rest: { type: Number, default: 90 },
            notes: { type: String, trim: true }
        }],
        default: {}
    }
}, { timestamps: true }); //Aggiungo automaticamente createdAt e updatedAt

module.exports = mongoose.model('WorkoutPlan', planModel);