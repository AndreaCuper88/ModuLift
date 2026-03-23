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
const genericRoutes = require('./routers/adminRouters/genericRouter');
const misureRouter = require('./routers/adminRouters/misureRouter');
const clienteRouterAdmin = require('./routers/adminRouters/clienteRouter_Admin');
const editorSchedeRouter = require('./routers/adminRouters/editorSchedeRouter');
const dashboardAdminRouter = require('./routers/adminRouters/dashboardAdminRouter');
const pianoAlimentareRouter = require('./routers/adminRouters/pianoAlimentareRouter');
const uploadsRouter = require('./routers/uploadsRouter');

//Import router clienti
const utilsRouter = require('./routers/clienteRouters/utilsRouter');
const trainingRouter = require('./routers/clienteRouters/trainingRouter');
const pianoUserAlimentareRouter = require('./routers/clienteRouters/pianoAlimentareRouter');
const misureClienteRouter = require('./routers/clienteRouters/misureRouter');

//Import middlewares
const verifyToken = require('./middlewares/verifyToken');
const requireRoles = require('./middlewares/requireRoles');

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
app.use(verifyToken);
app.use('/api/uploads', uploadsRouter);
app.use('/api/admin', requireRoles('admin'));
app.use('/api/generic', genericRoutes);
app.use('/api/admin/clienti', clienteRouterAdmin);
app.use('/api/admin/editorSchede', editorSchedeRouter);
app.use('/api/admin/pianoAlimentare', pianoAlimentareRouter);
app.use('/api/admin/misure', misureRouter);
app.use('/api/admin/dashboard', dashboardAdminRouter);
app.use('/api/cliente', requireRoles('cliente'));
app.use('/api/cliente/utils', utilsRouter);
app.use('/api/cliente/workout',trainingRouter);
app.use('/api/cliente/pianoAlimentare',pianoUserAlimentareRouter);
app.use('/api/cliente/misure', misureClienteRouter);

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});