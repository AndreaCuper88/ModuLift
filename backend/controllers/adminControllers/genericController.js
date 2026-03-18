const Utente = require('../../models/userModel');

// [GET] /api/admin/getCliente
exports.getCliente = async (req, res) => {
    try {
        const {id} = req.params;

        if (!id) {
            return res.status(400).json({ errore: "ID mancante" });
        }

        const cliente = await Utente.findOne({_id: id}).select("nome cognome avatarPath email");
        if (!cliente) {
            return res.status(404).json({errore: 'Cliente non trovato'});
        }
        res.status(200).json(cliente);
    } catch (e) {
        console.error("Errore durante il caricamento dei clienti: ",e);
        res.status(500).json({ errore: "Errore interno del server" });
    }
}