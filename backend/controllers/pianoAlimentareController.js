const mongoose = require('mongoose');
const PianoAlimentare = require('../models/pianoAlimentareModel');

exports.createOrUpdateLatestPiano = async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId) return res.status(401).json({ message: 'Non trovato' });

        const { mode = 'create-new', title, meals = [], comments = '', recommendations = '' } = req.body;
        if (!title || !Array.isArray(meals)) {
            return res.status(400).json({ message: 'Titolo e pasti sono obbligatori!' });
        }

        if (mode === 'update-latest') {
            // Trova il piano più recente per l’utente
            const latest = await PianoAlimentare.findOne({ user: userId })
                .sort({ createdAt: -1 });

            if (!latest) {
                // Se non esiste nessun piano, ne creo uno nuovo
                const newDoc = await PianoAlimentare.create({
                    user: userId,
                    title,
                    meals,
                    comments,
                    recommendations,
                });
                return res.status(201).json({
                    message: 'Creato nuovo piano (nessun piano precedente trovato)',
                    action: 'created',
                    plan: newDoc,
                });
            }

            // Aggiorna il piano più recente
            latest.title = title;
            latest.meals = meals;
            latest.comments = comments;
            latest.recommendations = recommendations;
            await latest.save();

            return res.status(200).json({
                message: 'Piano aggiornato correttamente',
                action: 'updated',
                plan: latest,
            });
        }

        // Altrimenti "create-new"
        const newDoc = await PianoAlimentare.create({
            user: userId,
            title,
            meals,
            comments,
            recommendations,
        });
        return res.status(201).json({
            message: 'Nuovo piano creato correttamente',
            action: 'created',
            plan: newDoc,
        });

    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ message: 'Titolo già utilizzato per questo utente' });
        }
        return res.status(500).json({ message: 'Errore creazione/aggiornamento piano', error: err?.message });
    }
};

// GET /api/piani-alimentari/latest?userId=...
exports.getLatestPiano = async (req, res) => {
    try {
        const userId = req.query.userId || req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: 'userId è obbligatorio' });
        }

        const latest = await PianoAlimentare
            .findOne({ user: userId })
            .sort({ createdAt: -1 });

        if (!latest) {
            // Nessun piano per questo utente
            return res.status(204).end();
        }

        return res.status(200).json(latest);
    } catch (err) {
        return res.status(500).json({ message: 'Errore recupero piano più recente', error: err?.message });
    }
};