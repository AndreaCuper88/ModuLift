const Utente = require('../../models/userModel');
const mongoose = require('mongoose');

// [GET] /api/clienti - Solo per admin
exports.getClienti = async (req, res) => {
    try {
        const clienti = await Utente.find({ruolo: 'cliente', attivo: true}).select("-password");
        res.status(200).json(clienti);
    } catch (e) {
        console.error("Errore durante il caricamento dei clienti: ",e);
        res.status(500).json({ errore: "Errore interno del server" });
    }
}

exports.deleteCliente = async (req, res) => {
    try {
        const {id} = req.params;

        //Controllo che l'id sia in un formato valido per mongodb
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({errore: "ID non valido"});
        }

        //Controllo che l'utente esista realmente
        const cliente = await Utente.findById(id);
        if (!cliente) {
            return res.status(404).json({errore: "Cliente non trovato"});
        }

        if (cliente.ruolo === "admin") {
            return res.status(403).json({ errore: "Non puoi eliminare un admin" });
        }

        await Utente.deleteOne({ _id: id });

        return res.status(200).json({
            messaggio: `Cliente ${cliente.email} eliminato definitivamente.`,
            deletedId: id
        });
    } catch (e) {
        console.error("Errore durante l'eliminazione:", e);
        return res.status(500).json({ errore: "Errore interno del server" });
    }
}

exports.disableCliente = async (req, res) => {
    try {
        const {id} = req.params;

        //Controllo che l'id sia in un formato valido per mongodb
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({errore: "ID non valido"});
        }

        //Controllo che l'utente esista realmente
        const cliente = await Utente.findById(id);
        if (!cliente) {
            return res.status(404).json({errore: "Cliente non trovato"});
        }

        //Disattivazione
        await Utente.updateOne({_id: id}, {$set: {attivo: false}});
        return res.status(200).json({
            messaggio: `Cliente ${cliente.email} disattivato con successo!`
        });
    } catch (e) {
        console.error("Errore durante la disattivazione: ", e);
        res.status(500).json({errore: "Errore interno del server"});
    }
}

exports.enableCliente = async (req, res) => {
    try {
        const {id} = req.params;

        //Controllo che l'id sia in un formato valido per mongodb
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({errore: "ID non valido"});
        }

        //Controllo che l'utente esista realmente
        const cliente = await Utente.findById(id);
        if (!cliente) {
            return res.status(404).json({errore: "Cliente non trovato"});
        }

        //Riattivazione
        await Utente.updateOne({_id: id}, {$set: {attivo: true}});
        return res.status(200).json({
            messaggio: `Cliente ${cliente.email} riattivato con successo!`
        });
    } catch (e) {
        console.error("Errore durante la riattivazione: ", e);
        res.status(500).json({errore: "Errore interno del server"});
    }
}