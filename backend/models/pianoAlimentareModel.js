const mongoose = require('mongoose');

const { Schema } = mongoose;

const PastoSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: '',
        },
    },
    { _id: false }
);

const PianoAlimentareSchema = new Schema(
    {
        // Riferimento all’utente
        user: {
            type: Schema.Types.ObjectId,
            ref: 'Utente',
            required: true,
            index: true,
        },

        // Dati dal frontend
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        meals: {
            type: [PastoSchema],
            default: [],
        },
        comments: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: '',
        },
        recommendations: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: '',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('PianoAlimentare', PianoAlimentareSchema);
