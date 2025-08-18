const PianoAllenamento = require('../../models/planModel');
const Esercizio = require('../../models/exerciseModel'); // name, imageUrl, ecc.
const WorkoutProgress = require('../../models/workoutProgressModel');

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

exports.upsertDayEntries = async (req, res) => {

    const userId = req.user?.id || req.user?._id; // settato da verifyToken
    if (!userId) res.status(404).json({ message: 'Utente non trovato' });

    const { planId, dayId } = req.params;
    const { entries } = req.body || {};

    if (!Array.isArray(entries)) {
        return res.status(400).json({ message: 'Bad request: errore sulle entries' });
    }

    try {
        const doc = await WorkoutProgress.findOneAndUpdate(
            { userId, planId },
            {
                $set: {
                    [`days.${dayId}`]: entries
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                runValidators: true
            }
        ).lean();

        return res.status(200).json({
            planId,
            dayId,
            entries: doc?.days?.get ? doc.days.get(dayId) : doc?.days?.[dayId] || entries,
            updatedAt: doc?.updatedAt
        });
    } catch (err) {
        console.error('upsertDayEntries error:', err);
        return res.status(500).json({ error: 'Errore salvataggio giorno', details: err.message });
    }
};