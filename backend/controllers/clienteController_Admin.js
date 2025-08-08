const Utente = require('../models/userModel');

// [GET] /api/clienti - Solo per admin
exports.getClienti = async (req, res) => {
    try {
        const clienti = await Utente.find({ruolo: 'cliente'}).select("-password");
        res.status(200).json(clienti);
    } catch (e) {
        console.error("Errore durante il caricamento dei clienti: ",e);
        res.status(500).json({ errore: "Errore interno del server" });
    }
}