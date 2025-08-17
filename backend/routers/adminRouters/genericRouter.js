const express = require('express');
const genericController = require("../../controllers/adminControllers/genericController");

const router = express.Router();

// [GET] /api/admin/generic/getCliente:id → Recupera un cliente (solo admin)
router.get(
    '/getCliente/:id',
    genericController.getCliente
);

module.exports = router;