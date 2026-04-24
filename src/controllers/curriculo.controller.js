const pdfService = require('../services/pdf.service');

// Expressões regulares para validação básica
const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const gerarPdf = async (req, res) => {
    try {
        const dados = req.body;

        // Validação de campos obrigatórios no servidor
        if (!dados.nome || dados.nome.trim() === '') {
            return res.status(400).json({ erro: 'O nome é obrigatório.' });
        }
        if (!dados.email || !isEmailValid(dados.email)) {
            return res.status(400).json({ erro: 'E-mail inválido ou ausente.' });
        }
        if (!dados.telefone || dados.telefone.trim() === '') {
            return res.status(400).json({ erro: 'O telefone é obrigatório.' });
        }
        if (!dados.cidade_estado || dados.cidade_estado.trim() === '') {
            return res.status(400).json({ erro: 'A cidade/estado é obrigatória.' });
        }
        if (!dados.objetivo || dados.objetivo.trim().length < 20) {
            return res.status(400).json({ erro: 'O objetivo profissional deve ter no mínimo 20 caracteres.' });
        }
        if (!dados.habilidades || !Array.isArray(dados.habilidades) || dados.habilidades.length === 0) {
            return res.status(400).json({ erro: 'É necessário informar pelo menos uma habilidade.' });
        }

        // Se houver foto (Extra 1), validar tipo mime baseado nos magic numbers de base64
        if (dados.foto) {
            // Verificar o header de um base64: data:image/jpeg;base64,... ou data:image/png;base64,...
            const isJpegOrPng = /^data:image\/(jpeg|png);base64,/.test(dados.foto);
            if (!isJpegOrPng) {
                return res.status(400).json({ erro: 'A foto deve ser no formato JPEG ou PNG.' });
            }
        }

        // Chama o serviço de PDF
        const pdfBuffer = await pdfService.gerarPdfCurriculo(dados);

        // Formatar nome do arquivo (minúsculas, espaços -> hífens)
        const nomeArquivo = `curriculo_${dados.nome.toLowerCase().replace(/\s+/g, '-')}.pdf`;

        // Configurar cabeçalhos para download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
        
        // Retornar o buffer do PDF
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        res.status(500).json({ erro: 'Erro interno ao gerar o PDF.' });
    }
};

module.exports = {
    gerarPdf
};
