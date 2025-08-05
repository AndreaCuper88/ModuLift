const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const utenteSchema = new mongoose.Schema({
    nome: {
        type: String,
        trim: true,
        required: [true, "Il nome è obbligatorio"],
    },
    cognome: {
        type: String,
        trim: true,
        required: [true, "Il cognome è obbligatorio"],
    },
    email: {
        type: String,
        trim: true,
        required: [true, "L'email è obbligatoria"],
        match: [/\S+@\S+\.\S+/, "L'email non è valida"],
        unique: true
    },
    password: {
        type: String,
        trim: true,
        required: [true, "La password è obbligatoria"],
        minlength: [8, "La password deve essere di almeno 8 caratteri"],
    },
    username: {
        type: String,
        trim: true,
        required: [true, "L'username è obbligatorio"],
        minlength: [6, "L'username deve essere almeno di 6 caratteri"],
    },
    ruolo: {
        type: String,
        enum: ['cliente' , 'admin'],
        default: 'cliente'
    },
    attivo: {
        type: Boolean,
        default: true
    },
    dataNascita: {
        type: Date,
        required: [true, "La data di nascita è obbligatoria"]
    },
    sesso: {
        type: String,
        enum: ['M', 'F', 'Altro'],
        required: false
    },
    dataRegistrazione: {
        type: Date,
        default: Date.now
    }
});

utenteSchema.pre('save', async function (next) { //pre('save') è un middleware di Mongoose, eseguito prima del .save()
    if(!this.isModified('password')) return next(); //next è una callback di mongoose che permette di andare avanti con le operazioni
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (e) {
        console.error('Errore durante l\'hashing della password:', e.message);
        next(e); //Passando l'errore dentro next non si esegue il .save()
    }
})

utenteSchema.methods.comparePassword = async function (pass) { //Dichiarazione di metodo personalizzato su mongoose
    return bcrypt.compare(pass, this.password);
}

// modello: 'utente', collezione forzata: 'utenti'
module.exports = mongoose.model('Utente', utenteSchema, 'utenti');