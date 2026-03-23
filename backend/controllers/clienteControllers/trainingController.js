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
    const { entries, sessionId } = req.body || {};

    if (!Array.isArray(entries)) {
        return res.status(400).json({ message: 'Bad request: errore sulle entries' });
    }
    try {
        const doc = await WorkoutProgress.findOneAndUpdate(
            { userId, planId, sessionId}, //sessionId per gestire sessioni separate e dare la possibilità di più workout al giorno
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

exports.getLastWorkout = async (req, res) => {
    try {
        const userId = req.user.id;

        const last = await WorkoutProgress.findOne({ userId })
            .sort({ updatedAt: -1 })
            .lean();

        if (!last) {
            return res.status(200).json(null);
        }

        const giorniRaw = last.days instanceof Map
            ? Object.fromEntries(last.days)
            : (last.days || {});

        const ids = [];
        Object.values(giorniRaw).forEach(voci => {
            voci.forEach(v => ids.push(v.exerciseId));
        });

        const esercizi = await Esercizio.find({ _id: { $in: ids } })
            .select("name")
            .lean();

        const mappaEsercizi = {};
        esercizi.forEach(e => {
            mappaEsercizi[e._id.toString()] = e.name;
        });

        const arrayGiorni = Object.entries(giorniRaw)
            .sort(([a], [b]) => {
                const n1 = parseInt(a.replace(/\D/g, ""));
                const n2 = parseInt(b.replace(/\D/g, ""));
                return n1 - n2;
            })
            .map(([chiaveGiorno, voci]) => ({
                giorno: `Giorno ${chiaveGiorno.replace(/\D/g, "")}`,
                esercizi: voci.map(v => ({
                    nome: mappaEsercizi[v.exerciseId?.toString()] || "Esercizio",
                    serie: v.sets
                }))
            }));

        res.status(200).json({
            planId: last.planId,
            data: last.updatedAt,
            giorni: arrayGiorni
        });

    } catch (err) {
        console.error("Errore getLastWorkout:", err.message, err.stack);
        res.status(500).json({ message: "Errore server", dettaglio: err.message });
    }
};