const Utente = require('../models/userModel');
const Exercise = require('../models/exerciseModel');
const WorkoutPlan = require('../models/planModel');
const mongoose = require('mongoose');

exports.getCountPiani = async (req, res) => {
    try {
        const tz = 'Europe/Rome';

        const startOfWeek = { $dateTrunc: { date: "$$NOW", unit: "week", timezone: tz } };
        const endOfWeek   = { $dateAdd: { startDate: startOfWeek, unit: "week", amount: 1 } };

        const result = await WorkoutPlan.aggregate([
            // 1) Solo documenti della settimana corrente [start, end)
            {
                $match: {
                    $expr: {
                        $and: [
                            { $gte: ["$createdAt", startOfWeek] },
                            { $lt:  ["$createdAt", endOfWeek] }
                        ]
                    }
                }
            },
            // 2) Giorno ISO della settimana 1..7 in timezone EU/Rome
            {
                $project: {
                    _id: 0,
                    dow: { $isoDayOfWeek: { date: "$createdAt", timezone: tz } } // 1=Lun ... 7=Dom
                }
            },
            // 3) Conteggio per giorno
            { $group: { _id: "$dow", count: { $sum: 1 } } },
            // 4) Trasforma in mappa { "1": countLun, ..., "7": countDom }
            { $project: { _id: 0, k: { $toString: "$_id" }, v: "$count" } },
            { $group: { _id: null, mapArray: { $push: { k: "$k", v: "$v" } } } },
            { $project: { countsMap: { $arrayToObject: "$mapArray" } } },
            // 5) Genera sempre 7 valori ordinati (se un giorno manca → 0)
            {
                $project: {
                    countsByDay: {
                        $map: {
                            input: { $range: [1, 8] },  // [1,2,3,4,5,6,7]
                            as: "d",
                            in: {
                                $ifNull: [
                                    { $getField: { input: "$countsMap", field: { $toString: "$$d" } } },
                                    0
                                ]
                            }
                        }
                    }
                }
            }
        ]);

// Estrarre l’array di conteggi:
        const counts = result[0]?.countsByDay ?? [0,0,0,0,0,0,0];
// counts = [Lun, Mar, Mer, Gio, Ven, Sab, Dom]

        res.status(200).json(counts)
    } catch (e) {
        console.log("Errore durante il caricamento del grafico: ", e);
    }
}

exports.getActiveUsers = async (req, res) => {
    try {
        const clientiCount = await Utente.countDocuments({ruolo: 'cliente', attivo: true});
        res.status(200).json(clientiCount);
    } catch (e) {
        console.error("Errore durante il caricamento degli utenti attivi:", e);
    }
}