const MisuraPliche = require('../../models/misureModel');

exports.getMisure = async (req, res) => {
    try {
        const userId = req.user.id;

        const misure = await MisuraPliche.find({ user: userId })
            .sort({ measuredAt: 1 })
            .lean();

        return res.status(200).json(misure);
    } catch (err) {
        console.error('Errore getMisure:', err.message);
        return res.status(500).json({ message: 'Errore nel recupero delle misure' });
    }
};