const jwt = require('jsonwebtoken');

//Funzione per generare refresh token e access token
const generaToken = (idUtente) => {
    const accessToken = jwt.sign(
        {id: idUtente},
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        {id: idUtente},
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
    return {accessToken, refreshToken};
}