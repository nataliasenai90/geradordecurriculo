document.addEventListener('DOMContentLoaded', () => {
    const DRAFT_KEY = 'curriculo_draft_v1';
    
    const form = document.getElementById('curriculo-form');
    const btnGerar = document.getElementById('btn-gerar');
    const btnText = btnGerar.querySelector('.btn-text');
    const spinner = btnGerar.querySelector('.spinner');
    const globalError = document.getElementById('global-error');
    
    // Dynamic lists
    const listaFormacoes = document.getElementById('lista-formacoes');
    const btnAddFormacao = document.getElementById('btn-add-formacao');
    const tplFormacao = document.getElementById('tpl-formacao');
    
    const listaExperiencias = document.getElementById('lista-experiencias');
    const btnAddExperiencia = document.getElementById('btn-add-experiencia');
    const tplExperiencia = document.getElementById('tpl-experiencia');
    
    // Habilidades
    const inputHabilidade = document.getElementById('input-habilidade');
    const chipsContainer = document.getElementById('chips-container');
    const habContainerDiv = document.querySelector('.habilidades-container');
    const habError = document.getElementById('habilidade-error');
    let habilidadesArray = [];

    // Foto
    const fotoInput = document.getElementById('foto');
    const fotoPreview = document.getElementById('foto-preview');
    const btnRemoverFoto = document.getElementById('btn-remover-foto');
    let fotoBase64 = '';

    // Dialog
    const dialogLimpar = document.getElementById('dialog-limpar');
    const btnLimpar = document.getElementById('btn-limpar');
    const btnCancelarLimpar = document.getElementById('btn-cancelar-limpar');
    const btnConfirmarLimpar = document.getElementById('btn-confirmar-limpar');

    // Inicializar Formações (pelo menos 1)
    function addFormacao(data = null) {
        const clone = tplFormacao.content.cloneNode(true);
        const item = clone.querySelector('.dynamic-item');
        
        // Popula anos no select de término
        const selTermino = item.querySelector('select[name="formacao_termino"]');
        const anoAtual = new Date().getFullYear();
        for(let ano = anoAtual + 10; ano >= 1950; ano--) {
            const opt = document.createElement('option');
            opt.value = ano; opt.textContent = ano;
            selTermino.appendChild(opt);
        }

        if(data) {
            item.querySelector('input[name="formacao_curso"]').value = data.curso || '';
            item.querySelector('input[name="formacao_instituicao"]').value = data.instituicao || '';
            item.querySelector('input[name="formacao_inicio"]').value = data.ano_inicio || '';
            selTermino.value = data.ano_termino || '';
        }

        item.querySelector('.btn-remover').addEventListener('click', () => {
            item.remove();
            saveDraft();
        });

        attachValidation(item.querySelectorAll('input, select, textarea'));
        listaFormacoes.appendChild(item);
    }

    // Inicializar Experiências (pelo menos 1)
    function addExperiencia(data = null) {
        const clone = tplExperiencia.content.cloneNode(true);
        const item = clone.querySelector('.dynamic-item');
        const checkAtual = item.querySelector('input[name="exp_atual"]');
        const inputFim = item.querySelector('input[name="exp_fim"]');

        checkAtual.addEventListener('change', (e) => {
            if(e.target.checked) {
                inputFim.value = '';
                inputFim.disabled = true;
                inputFim.classList.remove('input-invalid');
            } else {
                inputFim.disabled = false;
            }
            validateField(inputFim);
        });

        if(data) {
            item.querySelector('input[name="exp_empresa"]').value = data.empresa || '';
            item.querySelector('input[name="exp_cargo"]').value = data.cargo || '';
            item.querySelector('input[name="exp_inicio"]').value = data.data_inicio || '';
            if(data.atual) {
                checkAtual.checked = true;
                inputFim.disabled = true;
            } else {
                inputFim.value = data.data_fim || '';
            }
            item.querySelector('textarea[name="exp_descricao"]').value = data.descricao || '';
        }

        item.querySelector('.btn-remover').addEventListener('click', () => {
            item.remove();
            saveDraft();
        });

        attachValidation(item.querySelectorAll('input, select, textarea'));
        listaExperiencias.appendChild(item);
    }

    btnAddFormacao.addEventListener('click', () => { addFormacao(); saveDraft(); });
    btnAddExperiencia.addEventListener('click', () => { addExperiencia(); saveDraft(); });

    // Habilidades Chips
    function renderChips() {
        chipsContainer.innerHTML = '';
        habilidadesArray.forEach((hab, index) => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `${hab} <span data-index="${index}">&times;</span>`;
            chipsContainer.appendChild(chip);
        });
        validateHabilidades();
        saveDraft();
    }

    chipsContainer.addEventListener('click', (e) => {
        if(e.target.tagName === 'SPAN') {
            const index = e.target.getAttribute('data-index');
            habilidadesArray.splice(index, 1);
            renderChips();
        }
    });

    inputHabilidade.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = inputHabilidade.value.trim().replace(',', '');
            if(val && !habilidadesArray.includes(val)) {
                habilidadesArray.push(val);
                inputHabilidade.value = '';
                renderChips();
            }
        }
    });
    
    inputHabilidade.addEventListener('focus', () => habContainerDiv.classList.add('focus'));
    inputHabilidade.addEventListener('blur', () => habContainerDiv.classList.remove('focus'));

    function validateHabilidades() {
        if(habilidadesArray.length === 0) {
            habContainerDiv.classList.add('invalid');
            habContainerDiv.classList.remove('valid');
            habError.style.display = 'block';
            return false;
        } else {
            habContainerDiv.classList.remove('invalid');
            habContainerDiv.classList.add('valid');
            habError.style.display = 'none';
            return true;
        }
    }

    // Foto Base64
    fotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file) {
            // Verificar tipo
            if(file.type !== 'image/jpeg' && file.type !== 'image/png') {
                fotoInput.classList.add('input-invalid');
                fotoBase64 = '';
                fotoPreview.innerHTML = '<span>Sem Foto</span>';
                btnRemoverFoto.style.display = 'none';
                return;
            }
            fotoInput.classList.remove('input-invalid');
            
            const reader = new FileReader();
            reader.onload = function(event) {
                fotoBase64 = event.target.result;
                fotoPreview.innerHTML = `<img src="${fotoBase64}">`;
                btnRemoverFoto.style.display = 'block';
                saveDraft();
            };
            reader.readAsDataURL(file);
        }
    });

    btnRemoverFoto.addEventListener('click', () => {
        fotoBase64 = '';
        fotoInput.value = '';
        fotoPreview.innerHTML = '<span>Sem Foto</span>';
        btnRemoverFoto.style.display = 'none';
        saveDraft();
    });

    // Validação inline
    function validateField(field) {
        if(field.type === 'file' || field.id === 'input-habilidade' || field.name === 'template' || field.name === 'linkedin') {
            // Validações especiais ou opcionais
            if (field.name === 'linkedin' && field.value.trim() !== '') {
                try {
                    new URL(field.value);
                    field.classList.remove('input-invalid');
                    field.classList.add('input-valid');
                    return true;
                } catch(_) {
                    field.classList.add('input-invalid');
                    field.classList.remove('input-valid');
                    return false;
                }
            } else {
                field.classList.remove('input-invalid');
                if(field.value.trim() !== '' && field.name === 'linkedin') field.classList.add('input-valid');
                return true;
            }
        }
        
        let isValid = field.checkValidity();
        
        // Custom validations
        if(field.name === 'exp_fim' && !field.disabled && field.value.trim() === '') isValid = false;
        
        if(isValid) {
            field.classList.remove('input-invalid');
            field.classList.add('input-valid');
        } else {
            field.classList.add('input-invalid');
            field.classList.remove('input-valid');
        }
        return isValid;
    }

    function attachValidation(elements) {
        elements.forEach(el => {
            el.addEventListener('blur', () => { validateField(el); saveDraft(); });
            el.addEventListener('input', () => { if(el.classList.contains('input-invalid')) validateField(el); });
        });
    }
    
    attachValidation(form.querySelectorAll('input, select, textarea'));

    // Coletar Dados para submissão e save
    function getFormData() {
        const data = {
            template: document.getElementById('template').value,
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value,
            cidade_estado: document.getElementById('cidade_estado').value,
            linkedin: document.getElementById('linkedin').value,
            foto: fotoBase64,
            objetivo: document.getElementById('objetivo').value,
            habilidades: habilidadesArray,
            formacao: [],
            experiencia: []
        };

        listaFormacoes.querySelectorAll('.dynamic-item').forEach(item => {
            data.formacao.push({
                curso: item.querySelector('input[name="formacao_curso"]').value,
                instituicao: item.querySelector('input[name="formacao_instituicao"]').value,
                ano_inicio: item.querySelector('input[name="formacao_inicio"]').value,
                ano_termino: item.querySelector('select[name="formacao_termino"]').value
            });
        });

        listaExperiencias.querySelectorAll('.dynamic-item').forEach(item => {
            data.experiencia.push({
                empresa: item.querySelector('input[name="exp_empresa"]').value,
                cargo: item.querySelector('input[name="exp_cargo"]').value,
                data_inicio: item.querySelector('input[name="exp_inicio"]').value,
                data_fim: item.querySelector('input[name="exp_fim"]').value,
                atual: item.querySelector('input[name="exp_atual"]').checked,
                descricao: item.querySelector('textarea[name="exp_descricao"]').value
            });
        });

        return data;
    }

    // LocalStorage Draft
    function saveDraft() {
        const data = getFormData();
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    }

    function loadDraft() {
        const saved = localStorage.getItem(DRAFT_KEY);
        if(saved) {
            try {
                const data = JSON.parse(saved);
                document.getElementById('template').value = data.template || 'moderno';
                document.getElementById('nome').value = data.nome || '';
                document.getElementById('email').value = data.email || '';
                document.getElementById('telefone').value = data.telefone || '';
                document.getElementById('cidade_estado').value = data.cidade_estado || '';
                document.getElementById('linkedin').value = data.linkedin || '';
                document.getElementById('objetivo').value = data.objetivo || '';
                
                if(data.foto) {
                    fotoBase64 = data.foto;
                    fotoPreview.innerHTML = `<img src="${fotoBase64}">`;
                    btnRemoverFoto.style.display = 'block';
                }

                if(data.habilidades && data.habilidades.length) {
                    habilidadesArray = data.habilidades;
                    renderChips();
                }

                if(data.formacao && data.formacao.length) {
                    data.formacao.forEach(f => addFormacao(f));
                } else {
                    addFormacao();
                }

                if(data.experiencia && data.experiencia.length) {
                    data.experiencia.forEach(e => addExperiencia(e));
                } else {
                    addExperiencia();
                }
            } catch(e) {
                console.error("Erro ao carregar rascunho", e);
                addFormacao(); addExperiencia();
            }
        } else {
            addFormacao(); addExperiencia();
        }
    }

    // Form Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        globalError.style.display = 'none';
        
        let formValid = true;
        let firstInvalid = null;

        // Validar campos normais
        const elements = form.querySelectorAll('input, select, textarea');
        elements.forEach(el => {
            if(!validateField(el)) {
                formValid = false;
                if(!firstInvalid) firstInvalid = el;
            }
        });

        // Validar habilidades
        if(!validateHabilidades()) {
            formValid = false;
            if(!firstInvalid) firstInvalid = inputHabilidade;
        }

        if(!formValid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus();
            return;
        }

        // Preparar requisição
        btnGerar.disabled = true;
        btnText.textContent = 'Gerando...';
        spinner.style.display = 'inline-block';

        const payload = getFormData();

        try {
            const response = await fetch('/api/curriculo/gerar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if(!response.ok) {
                const errData = await response.json();
                throw new Error(errData.erro || 'Erro desconhecido ao gerar PDF');
            }

            // Tratamento do Blob (Download do PDF)
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `curriculo_${payload.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`;
            
            if(contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if(match && match[1]) filename = match[1];
            }

            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);

        } catch(error) {
            globalError.textContent = error.message;
            globalError.style.display = 'block';
            globalError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } finally {
            btnGerar.disabled = false;
            btnText.textContent = 'Gerar PDF';
            spinner.style.display = 'none';
        }
    });

    // Limpar Formulário
    btnLimpar.addEventListener('click', () => { dialogLimpar.showModal(); });
    btnCancelarLimpar.addEventListener('click', () => { dialogLimpar.close(); });
    
    btnConfirmarLimpar.addEventListener('click', () => {
        localStorage.removeItem(DRAFT_KEY);
        form.reset();
        habilidadesArray = [];
        renderChips();
        fotoBase64 = '';
        fotoPreview.innerHTML = '<span>Sem Foto</span>';
        btnRemoverFoto.style.display = 'none';
        listaFormacoes.innerHTML = '';
        listaExperiencias.innerHTML = '';
        addFormacao(); addExperiencia();
        
        // Remove validation classes
        form.querySelectorAll('.input-valid, .input-invalid').forEach(el => {
            el.classList.remove('input-valid', 'input-invalid');
        });
        
        dialogLimpar.close();
    });

    // Iniciar
    loadDraft();
    
    // Auto-save no change
    form.addEventListener('change', saveDraft);
});
