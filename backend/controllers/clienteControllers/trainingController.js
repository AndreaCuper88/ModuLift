const PianoAllenamento = require('../../models/planModel');
const Esercizio = require('../../models/exerciseModel'); // name, imageUrl, ecc.

exports.getWorkoutPlanFull = async (req, res) => {
    try {
        const planId = req.params.planId || req.query.plan || req.body.planId;
        if (!planId) return res.status(400).json({ message: 'planId mancante' });

        const doc = await PianoAllenamento.findById(planId).lean();
        if (!doc) return res.status(404).json({ message: 'Piano workout non trovato' });

        // Estrai gli exerciseId usati nel piano (day-1..day-7)
        const usedIds = new Set();
        const days = doc.plan || {};
        Object.values(days).forEach(arr => {
            if (Array.isArray(arr)) {
                arr.forEach(item => { if (item?.exerciseId) usedIds.add(item.exerciseId); });
            }
        });

        // Recupera solo gli esercizi necessari
        const exercises = await Esercizio.find({ _id: { $in: [...usedIds] } })
            .select('_id name imagePath muscle') // aggiungi altri campi se servono
            .lean();

        // Normalizza in mappa { [id]: esercizio }
        const catalog = {};
        for (const ex of exercises) catalog[ex._id.toString()] = ex;

        return res.status(200).json({ plan: doc, catalog });
    } catch (err) {
        if (err?.name === 'CastError') {
            return res.status(400).json({ message: 'planId non valido' });
        }
        return res.status(500).json({ message: 'Errore recupero piano workout', error: err?.message });
    }
};
