const PianoAlimentare = require('../../models/pianoAlimentareModel');

exports.getLatestPiano = async (req, res) => {
    try {
        const userId = req.user.id;

        const piano = await PianoAlimentare
            .findOne({ user: userId })
            .sort({ createdAt: -1 });

        if (!piano) {
            return res.status(404).json({
                message: "Nessun piano disponibile",
            });
        }

        res.status(200).json(piano);

    } catch (err) {
        console.error("Errore getLatestPiano:", err.message);

        res.status(500).json({
            message: "Errore server nel recupero del piano",
        });
    }
};