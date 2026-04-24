const express = require('express');
const router = express.Router();
const curriculoController = require('../controllers/curriculo.controller');

// Rota para gerar PDF
router.post('/gerar', curriculoController.gerarPdf);

module.exports = router;
