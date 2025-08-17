const express = require('express');
const router = express.Router();

//Import del controller di user
const utilsController = require('../../controllers/clienteControllers/utilsController');

router.get('/latestPiano',utilsController.getMyLatestPiano);

module.exports = router;