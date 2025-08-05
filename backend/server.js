const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend ModuLift attivo!');
});

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});