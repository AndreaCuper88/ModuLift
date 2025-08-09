const jwt = require('jsonwebtoken');

// Funzione per generare access token e (opzionalmente) refresh token
const generaToken = (idUtente, ruolo, soloAccessToken = false) => {
    const accessToken = jwt.sign(
        { id: idUtente , ruolo: ruolo},
        process.env.JWT_SECRET,
        { expiresIn: '1m' }
    );

    if (soloAccessToken) {
        return { accessToken };
    }

    const refreshToken = jwt.sign(
        { id: idUtente },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

module.exports = generaToken;
