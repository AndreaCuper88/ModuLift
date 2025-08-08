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

exports.login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await Utente.findOne({email});
        if (!user || !user.comparePassword(password)) {
            return res.status(401).json({dettagli: "Email o pasword non validi!!!"})
        }

        const {accessToken, refreshToken} =  generateToken(user._id, user.ruolo);    //Richiamo la funzione per generare i due tokens

        await RefreshToken.create({token: refreshToken, userId: user._id}); //Salvo il refresh token generato nel db

        //imposto il refreshToken in un cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true, //non può essere letto da javascript nel browser, solo il server può accedervi mediante req.cookies
            sameSite: 'Strict', //Cookie non leggibile da altre web app, possibile solo se la richiesta proviene dallo stesso dominio
            maxAge: 7 * 24 * 60 * 60 * 1000, // Scadenza 7 giorni (in millisecondi)
            secure: false
        });

        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                ruolo: user.ruolo
            },
            accessToken: accessToken,
        });
    } catch (e) {
        console.error("Errore nel login: ",e);
        res.status(500).json({errore: 'Errore nel login'});
    }
}

exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.jwt;

        if (!refreshToken) {
            return res.status(400).json({ messaggio: "Token non trovato" });
            //400 Bad Request
        }

        await RefreshToken.deleteOne({token: refreshToken});    //Cancello il refresh token dal db

        //Cancello il cookie
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: 'Strict',
            secure: false
        });

        res.status(200).json({ message: "Logout effettuato con successo" });
    } catch (e) {
        console.error("Errore durante il logout: ",e);
        res.status(500).json({errore: 'Errore interno del server'});
    }
}

exports.refreshToken = async (req, res) => {
    try {
        //Recupero il refreshToken dal cookie
        const refreshToken = req.cookies.jwt;

        if (!refreshToken) {
            res.status(401).json({dettagli: "Refresh Token mancante"});
        }

        //Verifico che il token sia ancora nel db
        const tokenDb = await RefreshToken.findOne({token: refreshToken});
        if (!tokenDb) {
            return res.status(403).json({dettagli: "Refresh Token non riconosciuto"});
        }

        //Verifico il refresh token
        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({dettagli: "Refresh Token scaduto o invalido"});
            }

            const { accessToken } = generateToken(decoded.id, true);

            return res.json({ accessToken });
        });
    } catch (err) {
        console.error("Errore nel refresh del token: ",err);
        return res.status(500).json({errore: 'Errore interno del server'});
    }
}