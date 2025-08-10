const mongoose = require('mongoose');
const { Schema } = mongoose;

// Enum muscoli principali
const MUSCLES = [
    'petto', 'dorso', 'gambe', 'quadricipiti', 'femorali', 'glutei',
    'spalle', 'deltoidi_anteriori', 'deltoidi_laterali', 'deltoidi_posteriori',
    'bicipiti', 'tricipiti', 'polpacci', 'addominali', 'obliqui'
];

const ExerciseSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    muscle: {
        type: String,
        enum: MUSCLES,
        required: true
    },
    imagePath: {
        type: String,
        trim: true,
        required: true
    }
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
