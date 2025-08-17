const planModel = require('../../models/planModel');

//Recupero l'id del piano di esercizi più recente
// /api/cliente/utils/latestPiano
exports.getMyLatestPiano = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Non autenticato' });

        const doc = await planModel
            .findOne({ userId: userId })
            .sort({ createdAt: -1, _id: -1 }) // ultimo creato
            .select('_id')
            .lean();

        if (!doc) return res.status(404).json({ message: 'Nessun piano trovato' });

        return res.status(200).json(doc);
    } catch (err) {
        return res.status(500).json({
            message: 'Errore nel recupero del piano più recente',
            error: err?.message,
        });
    }
};
