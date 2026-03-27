const express = require("express");
const router = express.Router();
const { generatePianoAlimentarePdf } = require("../../controllers/clienteControllers/pdfController");


router.post("/piano-alimentare", generatePianoAlimentarePdf);

module.exports = router;