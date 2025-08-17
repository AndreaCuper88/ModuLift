const Utente = require('../models/userModel');
const RefreshToken = require('../models/refreshTokenModel');
const jwt = require('jsonwebtoken');

const { calcAge } = require('../utils/calcAge')

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
        jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({dettagli: "Refresh Token scaduto o invalido"});
            }

            const user = await Utente.findById(decoded.id).select('ruolo');
            if (!user) {
                return res.status(404).json({ dettagli: "Utente non trovato" });
            }

            const { accessToken } = generateToken(decoded.id, user.ruolo, true);

            return res.json({ accessToken });
        });
    } catch (err) {
        console.error("Errore nel refresh del token: ",err);
        return res.status(500).json({errore: 'Errore interno del server'});
    }
};

exports.getAge = async (req, res) => {
    try {
        const { userId } = req.params; // /api/admin/utenti/:userId/getAge

        //Quindi la data attuale posso fornirla nella query string per praticità di utilizzo
        const at = req.query.at ? new Date(req.query.at) : new Date(); //Mentre per query, i dati provengono dalla query string (dopo il ?): aggiungi ?at=2023-08-16 ad esempio

        const user = await Utente.findById(userId).select('dataNascita');
        if (!user) return res.status(404).json({ message: 'Utente non trovato' });
        if (!user.dataNascita) {
            return res.status(404).json({ message: 'Data di nascita non disponibile' });
        }

        const age = calcAge(user.dataNascita, at);

        return res.status(200).json({
            age,                     // anni interi
            birthDate: user.birthDate,
            referenceDate: at,
        });
    } catch (err) {
        return res.status(500).json({ message: 'Errore recupero età utente', error: err?.message });
    }
};

exports.getSex = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await Utente.findById(userId).select('sesso');
        if (!user) return res.status(404).json({ message: 'Utente non trovato' });
        if (!user.sesso) {
            return res.status(404).json({ message: 'Sesso non disponibile per questo utente' });
        }

        // Normalizzazione: accetta 'male'/'female' oppure 'm'/'f'
        const raw = String(user.sesso).trim().toLowerCase();
        const normalized = raw === 'm' ? 'male' : raw === 'f' ? 'female' : raw;

        if (!['male', 'female'].includes(normalized)) {
            return res.status(422).json({
                message: 'Valore sesso non riconosciuto',
                raw: user.sesso,
            });
        }

        return res.status(200).json({ sex: normalized });
    } catch (err) {
        return res.status(500).json({ message: 'Errore recupero sesso utente', error: err?.message });
    }
};

exports.getHeight = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await Utente.findById(userId).select('altezza');
        if (!user) return res.status(404).json({ message: 'Utente non trovato' });
        if (!user.altezza) {
            return res.status(404).json({ message: 'Altezza non disponibile per questo utente' });
        }
        return res.status(200).json(user.altezza);
    } catch (err) {
        return res.status(500).json({ message: 'Errore recupero altezza utente', error: err?.message });
    }
};