# Gerador de Currículo em PDF

Aplicação fullstack para geração dinâmica de currículos profissionais em formato PDF. Desenvolvida como projeto para a sala de aula, utiliza Node.js, Express e Puppeteer no backend, e Vanilla JS com HTML5 Semântico/CSS3 no frontend.

## Pré-requisitos
- Node.js 18+ (LTS)
- npm (Node Package Manager)

## Como instalar e rodar

1. Clone ou baixe o projeto.
2. Acesse a pasta raiz do projeto no terminal.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Crie o arquivo `.env` copiando o exemplo:
   ```bash
   cp .env.example .env
   ```
5. Inicie o servidor:
   ```bash
   npm start
   ```
   *O servidor rodará na porta 3000 por padrão, e o frontend estará disponível em `http://localhost:3000`*.

## Funcionalidades Implementadas

- **Frontend sem frameworks:** CSS variables, Flexbox e Grid. Sem Bootstrap ou Tailwind.
- **Validação em tempo real:** Erros inline no evento "blur" dos inputs.
- **Seções Dinâmicas:** Adição e remoção infinita de Formaçoes e Experiências.
- **Habilidades em Chips:** Sistema de tags para adicionar habilidades (acionado por Enter ou vírgula).
- **Auto-save (Rascunho):** Utilização de localStorage com chave versionada (`curriculo_draft_v1`) para evitar perda de dados.
- **Geração de PDF no Server:** A lógica reside integralmente no Backend.
- **[EXTRA 1] Upload de Foto:** O formulário permite anexar foto que é enviada em base64 e validada magic numbers (JPEG/PNG) no Node.js.
- **[EXTRA 2] Múltiplos Templates:** Possibilidade de escolha entre Template "Moderno" (Fontes Inter, visual sem bordas fortes) e Template "Clássico" (Fonte Serifada Lora, alto contraste).

## Justificativa de Geração de PDF (Puppeteer)

O **Puppeteer** foi selecionado no lugar do *PDFKit* devido à flexibilidade imposta pelo projeto (Suporte a temas/templates extras). O uso de marcação HTML e variáveis CSS (`body.classic`, `body.modern`) permite alternar completamente o design do currículo trocando apenas uma classe, sem a necessidade de reprogramar complexas coordenadas geométricas em Javascript (como seria o caso de `doc.text(x,y)` no PDFKit). 

> **Nota para ambiente Serverless:** O Puppeteer foi instanciado utilizando `--no-sandbox` e args mínimos para rodar tranquilamente na maioria dos ambientes Serverless.

## Estrutura de Pastas

```
/projeto
  /public          → HTML, CSS e Vanilla JS
  /src
    /routes        → Mapeamento de endpoints do Express
    /controllers   → Validação de payloads e acionamento de serviços
    /services      → Serviço que instancia o Puppeteer e mescla o Template HTML
    /templates     → Base HTML para injeção de dados (curriculo.html)
  server.js        → Ponto de entrada do Backend
```

## Endpoints da API

### `POST /api/curriculo/gerar`
Recebe o payload do frontend, realiza a renderização via Puppeteer e retorna o PDF como stream (Attachment).

- **Body Esperado (JSON):**
  ```json
  {
    "template": "moderno",
    "nome": "João",
    "email": "joao@email.com",
    "telefone": "(11) 9999-9999",
    "cidade_estado": "SP",
    "objetivo": "Mais de 20 caracteres...",
    "foto": "data:image/jpeg;base64,...",
    "habilidades": ["JS", "Node"],
    "formacao": [{ "curso": "Eng", "instituicao": "USP", "ano_inicio": "2010", "ano_termino": "2015" }],
    "experiencia": [{ "empresa": "Tech", "cargo": "Dev", "data_inicio": "2020-01", "data_fim": "", "atual": true, "descricao": "..." }]
  }
  ```
- **Resposta Sucesso (200 OK):** Arquivo Blob `application/pdf` (Attachment).
- **Resposta Erro (400 Bad Request):** `{ "erro": "Mensagem descritiva" }`

### `GET /health`
Endpoint simples de verificação do status da API.
- **Resposta:** `200 OK` `{ "status": "ok" }`
