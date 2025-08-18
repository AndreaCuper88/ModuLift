// models/WorkoutProgress.js
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const setSchema = new Schema({
    weight: { type: Number, min: 0 },
    reps:   { type: Number, min: 0, default: null } // consento null
}, { _id: false });

const entrySchema = new Schema({
    exerciseId: { type: Types.ObjectId, ref: 'Exercise', required: true },
    uid:        { type: String, required: true }, // es. UUID v4 lato client
    sets:       { type: [setSchema], default: [] }
}, { _id: false });

const workoutProgressSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'Utente', required: true, index: true },
    planId: { type: Types.ObjectId, ref: 'WorkoutPlan', required: true, index: true },

    // Mappa dei giorni: es. "day-1" -> [entry, entry, ...]
    days: {
        type: Map,
        of: [entrySchema],
        default: {}
    },

    // metadati utili per sync/offline
    etag:          { type: String, default: null },
    lastSyncedAt:  { type: Date,   default: null }
}, {
    timestamps: true, // createdAt / updatedAt
    minimize: true
});

module.exports = mongoose.model('WorkoutProgress', workoutProgressSchema, "workoutProgress");
