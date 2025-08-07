//Middleware per la verifica del token e quindi per la gestione delle rotte protette

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    //Recupero l'header dalla richiesta
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')) { //Nego l'accesso
        return res.status(401).send('Accesso negato.');
    }

    const token = authHeader.split('Bearer ')[1]; //Estraggo il token rimuovendo "Barer " dalla stringa

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        //req è un oggetto condiviso quindi il middleware successivo
        //avrà a disposizione req.user e potrà verificare chi ha fatto la richiesta
        next();
    } catch (e) {
        console.error("Token non valido: ",e);
        return res.status(401).send('Accesso negato.');
    }
};

module.exports = verifyToken;