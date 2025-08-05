const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

//Middlewares
app.use(cors({
        origin: FRONTEND_ORIGIN,
        credentials: true,
    }
))
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend ModuLift attivo!');
});

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});