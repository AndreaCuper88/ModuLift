const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema ({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'utenti', //Faccio riferimento all'id utente
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 7*24*60*60, //Scade dopo 7 giorni
    },
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);