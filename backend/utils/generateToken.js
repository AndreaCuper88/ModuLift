const jwt = require('jsonwebtoken');

// Funzione per generare access token e (opzionalmente) refresh token
const generaToken = (idUtente, soloAccessToken = false) => {
    const accessToken = jwt.sign(
        { id: idUtente },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
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
