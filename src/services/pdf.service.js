const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Função responsável por ler o template HTML e injetar os dados para a geração
 */
const gerarHtml = (dados) => {
    const templatePath = path.join(__dirname, '../templates/curriculo.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    // Substituir dados pessoais
    template = template.replace('{{nome}}', dados.nome || '');
    
    // Contatos (separados por |)
    const contatos = [dados.telefone, dados.email, dados.cidade_estado];
    if (dados.linkedin) contatos.push(dados.linkedin);
    template = template.replace('{{contatos}}', contatos.join(' | '));

    // Foto (se houver)
    let fotoHtml = '';
    if (dados.foto) {
        fotoHtml = `<img src="${dados.foto}" alt="Foto de Perfil" class="foto-perfil" />`;
    }
    template = template.replace('{{foto}}', fotoHtml);

    // Objetivo
    template = template.replace('{{objetivo}}', dados.objetivo ? dados.objetivo.replace(/\n/g, '<br>') : '');

    // Formação (ordem cronológica inversa recomendada, já deve vir assim do frontend ou faremos aqui se necessário. 
    // Como o usuário os insere na ordem que quer, nós apenas renderizamos na ordem que chegar do array)
    let formacaoHtml = '';
    if (dados.formacao && Array.isArray(dados.formacao)) {
        // Inverte no backend caso o frontend não o tenha feito, ou apenas itera. 
        // Vamos iterar e montar (assumimos que o formatação via front será enviada conforme ordem inserida, 
        // mas as diretrizes dizem ordem cronológica inversa: "mais recente primeiro". 
        // Como não temos validação rígida de data, vamos apenas renderizar na ordem que chega. 
        // Idealmente, o usuário deve inserir as mais recentes no topo. 
        // Faremos um .reverse() para garantir a exibição inversa da inserção se preferir. 
        // Melhor: assumiremos que já chega na ordem, e desenhamos:
        dados.formacao.forEach(item => {
            const periodo = item.ano_termino === 'Em andamento' 
                ? `${item.ano_inicio} - Em andamento` 
                : `${item.ano_inicio} - ${item.ano_termino}`;
            formacaoHtml += `
                <div class="item">
                    <h4>${item.curso}</h4>
                    <p><strong>${item.instituicao}</strong> | ${periodo}</p>
                </div>
            `;
        });
    }
    template = template.replace('{{formacoes}}', formacaoHtml);

    // Experiências
    let experienciaHtml = '';
    if (dados.experiencia && Array.isArray(dados.experiencia)) {
        dados.experiencia.forEach(item => {
            const periodo = item.atual === true || item.atual === 'true' 
                ? `${item.data_inicio} - Atual` 
                : `${item.data_inicio} - ${item.data_fim}`;
            experienciaHtml += `
                <div class="item">
                    <h4>${item.cargo}</h4>
                    <p><strong>${item.empresa}</strong> | ${periodo}</p>
                    <p class="desc">${item.descricao.replace(/\n/g, '<br>')}</p>
                </div>
            `;
        });
    }
    template = template.replace('{{experiencias}}', experienciaHtml);

    // Habilidades
    let habilidadesHtml = '';
    if (dados.habilidades && Array.isArray(dados.habilidades)) {
        habilidadesHtml = dados.habilidades.join(' • ');
    }
    template = template.replace('{{habilidades}}', habilidadesHtml);

    // Template Selector (Classic vs Modern) - Extra 2
    let bodyClass = 'classic';
    if (dados.template === 'moderno') {
        bodyClass = 'modern';
    }
    template = template.replace('{{body_class}}', bodyClass);

    return template;
};

const gerarPdfCurriculo = async (dados) => {
    const htmlContent = gerarHtml(dados);

    // Instanciar o browser com flags para ambientes Serverless
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '20mm',
                right: '20mm'
            }
        });

        await browser.close();
        return pdfBuffer;
    } catch (error) {
        await browser.close();
        throw error;
    }
};

module.exports = {
    gerarPdfCurriculo
};
