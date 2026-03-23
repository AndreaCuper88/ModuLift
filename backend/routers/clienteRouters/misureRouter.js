const express = require('express');
const router = express.Router();
const { getMisure } = require('../../controllers/clienteControllers/misureController');

router.get('/', getMisure);

module.exports = router;