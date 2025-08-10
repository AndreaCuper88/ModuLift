const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

//Importazione Rotte
const userRoutes = require('./routers/userRouter');
const clienteRouterAdmin = require('./routers/clienteRouter_Admin');
const editorSchedeRouter = require('./routers/editorSchedeRouter');

//Connessione al db
connectDB().then(async () => console.log('Connesso a MongoDB!!!'));

//Middlewares
app.use(cors({ //Permetto le richieste da parte del frontend
        origin: FRONTEND_ORIGIN,
        credentials: true,
    }
))
app.use(express.json()); //Permette di leggere json nel body delle richieste
app.use(cookieParser()); //Per poter utilizzare cookie HTTP only

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//Rotte API
app.use('/api/users', userRoutes);
app.use('/api/clienti', clienteRouterAdmin);
app.use('/api/editorSchede', editorSchedeRouter);

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});