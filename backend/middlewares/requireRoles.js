module.exports = function requireRoles(...allowedRoles) {
    return (req, res, next) => {
        // Assumiamo che req.user sia già popolato da verifyToken
        if (!req.user || !req.user.ruolo) {
            return res.status(403).json({ message: "Accesso negato: ruolo mancante" });
        }

        // Se il ruolo dell'utente è tra quelli permessi → passa
        if (allowedRoles.includes(req.user.ruolo)) {
            return next();
        }

        // Altrimenti blocca
        return res.status(403).json({ message: "Accesso negato: ruolo non autorizzato" });
    };
};