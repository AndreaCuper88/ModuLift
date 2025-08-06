const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

//Importazione Rotte
const userRoutes = require('./routers/userRouter');

//Connessione al db
connectDB().then(async () => console.log('Connesso a MongoDB!!!'));

//Middlewares
app.use(cors({ //Permetto le richieste da parte del frontend
        origin: FRONTEND_ORIGIN,
        credentials: true,
    }
))
app.use(express.json()); //Permette di leggere json nel body delle richieste

//Rotte API
app.use('/api/user', userRoutes);

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});