const MisuraPliche = require('../../models/misureModel');



exports.upsertMisure = async (req, res) => {
    try {
        const items = Array.isArray(req.body) ? req.body : [req.body];
        const results = [];

        for (const it of items) { //Controllo per ogni campione
            const {
                user, userId, measuredAt,
                method, sex, ageAtMeasure, sites,
                pesoKg, toraceCm, spalleCm, bicipiteCm, ombelicoCm, quadricipiteCm,
            } = it;

            const uid = user || userId;               // accetta user o userId
            const when = measuredAt ? new Date(measuredAt) : undefined;

            let doc = await MisuraPliche.findOne({ user: uid, measuredAt: when });

            if (!doc) {
                // create
                doc = new MisuraPliche({
                    user: uid,
                    measuredAt: when,
                    method,
                    sex,
                    ageAtMeasure,
                    sites,
                    pesoKg,
                    toraceCm,
                    spalleCm,
                    bicipiteCm,
                    ombelicoCm,
                    quadricipiteCm,
                });
                await doc.save(); // calcola derived/isComplete via pre('save')
                results.push({ measuredAt: when, action: 'created', id: doc._id });
            } else {
                // update (solo i campi passati)
                if (method !== undefined) doc.method = method;
                if (sex !== undefined) doc.sex = sex;
                if (ageAtMeasure !== undefined) doc.ageAtMeasure = ageAtMeasure;
                if (sites !== undefined) doc.sites = sites;

                if (pesoKg !== undefined) doc.pesoKg = pesoKg;
                if (toraceCm !== undefined) doc.toraceCm = toraceCm;
                if (spalleCm !== undefined) doc.spalleCm = spalleCm;
                if (bicipiteCm !== undefined) doc.bicipiteCm = bicipiteCm;
                if (ombelicoCm !== undefined) doc.ombelicoCm = ombelicoCm;
                if (quadricipiteCm !== undefined) doc.quadricipiteCm = quadricipiteCm;

                await doc.save(); // ricalcola derived/isComplete
                results.push({ measuredAt: when, action: 'updated', id: doc._id });
            }
        }

        return res.status(200).json({
            message: 'Upsert misure completato',
            count: results.length,
            results,
        });
    } catch (err) {
        return res.status(500).json({ message: 'Errore upsert misure', error: err?.message });
    }
};

// Helper date -> "YYYY-MM-DD" (UTC)
const fmtDate = (d) => {
    const x = new Date(d);
    const y = x.getUTCFullYear();
    const m = String(x.getUTCMonth() + 1).padStart(2, '0');
    const day = String(x.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

exports.getEntriesByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const docs = await MisuraPliche
            .find({ user: userId })
            .sort({ measuredAt: 1, _id: 1 });

        const entries = docs.map((doc) => ({
            user: String(doc.user),
            measuredAt: fmtDate(doc.measuredAt),
            method: doc.method || 'JP3',
            ageAtMeasure: doc.ageAtMeasure ?? null,
            sites: doc.sites instanceof Map ? Object.fromEntries(doc.sites) : (doc.sites || {}),

            pesoKg: doc.pesoKg ?? null,
            toraceCm: doc.toraceCm ?? null,
            spalleCm: doc.spalleCm ?? null,
            bicipiteCm: doc.bicipiteCm ?? null,
            ombelicoCm: doc.ombelicoCm ?? null,
            quadricipiteCm: doc.quadricipiteCm ?? null,
        }));

        return res.status(200).json(entries);
    } catch (err) {
        return res.status(500).json({ message: 'Errore caricamento misure utente', error: err?.message });
    }
};