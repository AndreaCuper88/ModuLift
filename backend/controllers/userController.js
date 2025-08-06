const Utente = require('../models/userModel');
const RefreshToken = require('../models/refreshTokenModel');
const jwt = require('jsonwebtoken');

const generateToken = require('../utils/generateToken');    //Richiamo la funzione per generare i token

exports.createUser = async (req, res) => {
    try {
        const {username, email, password, nome, cognome, dataNascita, sesso} = req.body;

        //Controlli per evitare duplicati
        if (await Utente.findOne({username})) {
            return res.status(400).send({dettagli: "Username già in uso!!!"})
            //400 Bad Request
        }
        if (await Utente.findOne({email})) {
            return res.status(400).send({dettagli: "Email già in uso!!!"})
            //400 Bad Request
        }
        const newUser = new Utente({username, email, password, nome, cognome, dataNascita, sesso});
        await newUser.save();
        res.status(201).json({ message: "Utente creato con successo" });
    } catch (e) {
        console.error(e);
        res.status(500).send({errore: 'Errore nella creazione utente'})
        //500 Internal Server Error
    }
}