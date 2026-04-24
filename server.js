const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const curriculoRoutes = require('./src/routes/curriculo.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/curriculo', curriculoRoutes);

// Endpoint de health check (solicitado diretamente na raiz do servidor também, ou /api/curriculo/health)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Tratamento de rotas não encontradas
app.use((req, res, next) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
    console.error('Erro interno:', err.stack);
    res.status(500).json({ erro: 'Erro interno no servidor' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
