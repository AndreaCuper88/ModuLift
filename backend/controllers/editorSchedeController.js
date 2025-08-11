const Utente = require('../models/userModel');
const Exercise = require('../models/exerciseModel');
const WorkoutPlan = require('../models/planModel');
const mongoose = require('mongoose');


// [GET] /api/editorSchede/getCliente
exports.getCliente = async (req, res) => {
    try {
        const {id} = req.params;
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

// [GET] /api/editorSchede/getExercises
exports.getExercises = async (req, res) => {
    try {
        const exercises = await Exercise.find({});
        if (!exercises) {
            return res.status(404).json({errore: 'Nessun esercizio trovato'});
        }
        res.status(200).json(exercises);
    } catch (e) {
        console.error("Errore durante il caricamento degli esercizi: ",e);
        res.status(500).json({ errore: "Errore interno del server" });
    }
}

exports.createExercise = async (req, res) => {
    try {
        const { name, muscle, imagePath } = req.body;

        if (!name || !muscle || !imagePath) {
            return res.status(400).json({ errore: 'name, muscle, imagePath sono obbligatori' });
        }

        const doc = await Exercise.create({ name, muscle, imagePath });
        return res.status(201).json(doc);
    } catch (e) {
        console.error('Errore createExercise:', e);
        // Se l'errore è di validazione Mongoose (es. enum muscle)
        if (e.name === 'ValidationError') {
            return res.status(400).json({ errore: e.message });
        }
        return res.status(500).json({ errore: 'Errore interno del server' });
    }
};

exports.removeExercise = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID esercizio mancante" });
        }
        const deleted = await Exercise.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Esercizio non trovato" });
        }
        return res.status(200).json({
            message: "Esercizio eliminato con successo",
            deleted
        });
    } catch (e) {
        console.error("Errore durante la rimozione dell'esercizio: ",e);
        res.status(500).json({ errore: "Errore interno del server" });
    }
}

/**
 * Gestione di: update plan, set plan ecc...
 */

function normalizzaPiano(planMapOrObj) {
    if (!planMapOrObj) return {}; //Se il valore è vuoto/nullo ritorno un oggetto vuoto in modo da evitare errori
    //Se arriva come map da Mongoose converto, per evitare conflitti di dato
    const raw = planMapOrObj instanceof Map ? Object.fromEntries(planMapOrObj) : planMapOrObj;
    const giorniOrdinati = Object.keys(raw).sort(); //Ordino in base ai giorni

    const out = {}; //Creo un oggetto vuoto che sarà l'output normalizzato
    for (const day of giorniOrdinati) {
        const arr = Array.isArray(raw[day]) ? raw[day] : []; //Prendo il valore associato ad un determinato giorno, se non è un array ne restituisco uno vuoto per evitare errori
        //Mappo out nel formato che mi serve
        out[day] = arr.map(item => ({
            uid: String(item.uid),
            exerciseId: String(item.exerciseId),
            scheme: (item.scheme || []).map(r => ({ count: Number(r.count), reps: Number(r.reps) })),
            rest: Number(item.rest ?? 0),
            notes: item.notes ?? ""
        }));
    }
    return out;
}

function isSamePlan (doc, bodyWeeks, bodyPlan) {
    if (!doc) return false;
    if(Number(doc.weeks) !== Number(bodyWeeks)) return false;

    const a = normalizzaPiano(doc.plan); //Piano nel db
    const b = normalizzaPiano(bodyPlan); //Piano ricevuto nel body della richiesta

    return JSON.stringify(a) === JSON.stringify(b); //Ritorno il confronto
}

function isExpired(planDoc) {   //Verifico se il piano è scaduto
    if (!planDoc?.createdAt || !planDoc?.weeks) return false;
    const ms = planDoc.weeks * 7 * 24 * 60 * 60 * 1000;     //Sistemo le settimane
    const expireAt = new Date(planDoc.createdAt.getTime() + ms);    //Sistemo la data di creazione
    return new Date() >= expireAt;
}

exports.setPlan = async (req, res) => {
    try {
        const {userId, weeks, plan} = req.body;

        if (!userId || !weeks || !plan) {
            return res.status(400).json({errore: 'Dati richiesti non trovati'});
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({message: "User id non valido!!!"});
        }

        //Cerco un eventuale piano esistente
        const existingPlan = await WorkoutPlan.findOne({ userId }).sort({ createdAt: -1 }); //Prendo il più recente

        if (existingPlan && isExpired(existingPlan)) {
            const created = await WorkoutPlan.create({ userId, weeks, plan });
            return res.status(201).json({
                message: 'Piano scaduto: creato nuovo piano.',
                changed: true,
                plan: created
            });
        }

        //Se è uguale, non fare update, non serve
        if (existingPlan && isSamePlan(existingPlan, weeks, plan)) {
            return res.status(200).json({
                message: "Nessuna modifica apportata, il piano è identico...",
                changed: false,
                plan: existingPlan
            });
        }

        //Altrimenti aggiorna/crea nuovo
        const updated = await WorkoutPlan.findOneAndUpdate(
            { userId },
            {
                $set: {
                    weeks,
                    plan,
                    updatedAt: new Date()
                },
                $setOnInsert: {createdAt: new Date()},
            },
            {new: true, upsert: true}
            //new: ottengo subito il piano da ritornare al cilent
            //upsert: se l'utente non ha ancora un piano viene creato
        );
        return res.status(200).json({
            message: existingPlan ? "Piano aggiornato" : "Piano creato",
        })

    } catch (e) {
        console.error('Errore upsertPlan:', e);
        return res.status(500).json({ message: 'Errore interno', error: e.message });
    }
}

//Caricamento dell'ultimo piano attivo dell'utente
exports.loadPlan = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({message: "User id non valido!!!"});
        }
        //Cerco il piano nel db
        const plan = await WorkoutPlan
            .findOne({userId})
            .sort({createdAt: -1}) //Ordine decrescente
            .lean(); //Restituisco semplici oggetti JS, non documenti mongoose
        if (!plan) {
            return res.status(404).json({errore: 'Piano non trovato!'});
        }

        if(isExpired(plan)) { //Se il piano è scaduto ritorno tutto vuoto
            return res.status(200).json({ userId, weeks: 0, plan: {} });
        }
        return res.status(200).json(plan)
    } catch (e) {
        console.error('getLatestPlan error:', e);
        return res.status(500).json({ message: 'Errore interno', error: e.message });
    }
}