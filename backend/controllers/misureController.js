const mongoose = require('mongoose');
const MisuraPliche = require('../models/misureModel');



exports.createMisura = async (req, res) => {
    try {
        const {
            userId,
            sex,                       // 'male' | 'female'
            method = 'JP3',
            measuredAt,
            ageAtMeasure,

            // pliche (mm) — es. { chest: 8, abdomen: 12, thigh: 11 } o { triceps: 14, ... }
            sites = {},

            // antropometria
            pesoKg,
            toraceCm,
            spalleCm,
            bicipiteCm,
            ombelicoCm,
            quadricipiteCm,
        } = req.body;

        if (!userId) return res.status(400).json({ message: 'userId è obbligatorio' });
        if (!sex || !['male','female'].includes(sex)) {
            return res.status(400).json({ message: 'sex deve essere "male" o "female"' });
        }
        if (typeof sites !== 'object' || sites === null) {
            return res.status(400).json({ message: 'sites deve essere un oggetto {site: mm}' });
        }

        // Normalizzo numeri (gestisce stringhe numeriche, vuoti, undefined)
        const num = v => (v === '' || v === null || v === undefined ? undefined : Number(v));
        const normalizedSites = Object.fromEntries( //Applico num ad ogni valore di sites
            Object.entries(sites).map(([k, v]) => [k, num(v)]) //Restituisco una nuova coppia, chiave-valore con il valore normalizzato
        );

        const doc = new MisuraPliche({
            user: new mongoose.Types.ObjectId(userId),
            sex,
            method,
            measuredAt: measuredAt ? new Date(measuredAt) : undefined,
            ageAtMeasure: num(ageAtMeasure),
            sites: normalizedSites,

            pesoKg: num(pesoKg),
            toraceCm: num(toraceCm),
            spalleCm: num(spalleCm),
            bicipiteCm: num(bicipiteCm),
            ombelicoCm: num(ombelicoCm),
            quadricipiteCm: num(quadricipiteCm),
        });

        // .save() per attivare il pre('save') che calcola i derivati
        await doc.save();

        return res.status(201).json({
            message: 'Rilevazione pliche salvata correttamente',
            action: 'created',
            misura: doc,
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Errore salvataggio rilevazione',
            error: err?.message,
        });
    }
};