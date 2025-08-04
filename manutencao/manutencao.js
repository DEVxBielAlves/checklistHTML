// Sistema de Manutenção - JavaScript

// Variáveis globais
let currentSection = 0;
const totalSections = 12;
let checklistData = {};

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeChecklist();
    setupEventListeners();
    updateProgress();
});

// Inicializar o checklist
function initializeChecklist() {
    // Mostrar apenas a primeira seção
    showSection(0);
    
    // Inicializar dados do checklist
    checklistData = {
        dadosIniciais: {},
        secoes: {},
        observacoes: {},
        uploads: {}
    };
}

// Configurar event listeners
function setupEventListeners() {
    // Botões de status
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', handleStatusClick);
    });
    
    // Botões de navegação
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', nextSection);
    });
    
    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', prevSection);
    });
    
    // Campos de observação
    document.querySelectorAll('textarea[data-obs]').forEach(textarea => {
        textarea.addEventListener('input', handleObservationChange);
    });
    
    // Campos de upload
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', handleFileUpload);
    });
    
    // Campos de dados iniciais
    document.querySelectorAll('input[data-field]').forEach(input => {
        input.addEventListener('input', handleDataChange);
    });
}

// Manipular clique nos botões de status
function handleStatusClick(event) {
    const btn = event.currentTarget;
    const item = btn.dataset.item;
    const status = btn.dataset.status;
    const section = btn.closest('.section');
    
    // Remover seleção anterior
    section.querySelectorAll(`[data-item="${item}"]`).forEach(b => {
        b.classList.remove('selected', 'bg-green-100', 'border-green-400', 'bg-red-100', 'border-red-400', 'bg-yellow-100', 'border-yellow-400');
    });
    
    // Adicionar seleção atual
    btn.classList.add('selected');
    
    if (status === 'conforme' || status === 'sim') {
        btn.classList.add('bg-green-100', 'border-green-400');
    } else if (status === 'nao_conforme' || status === 'nao') {
        btn.classList.add('bg-red-100', 'border-red-400');
    } else if (status === 'na') {
        btn.classList.add('bg-yellow-100', 'border-yellow-400');
    }
    
    // Salvar dados
    const sectionId = section.id;
    if (!checklistData.secoes[sectionId]) {
        checklistData.secoes[sectionId] = {};
    }
    checklistData.secoes[sectionId][item] = status;
    
    updateProgress();
}

// Manipular mudanças nas observações
function handleObservationChange(event) {
    const textarea = event.target;
    const item = textarea.dataset.obs;
    const section = textarea.closest('.section');
    const sectionId = section.id;
    
    if (!checklistData.observacoes[sectionId]) {
        checklistData.observacoes[sectionId] = {};
    }
    checklistData.observacoes[sectionId][item] = textarea.value;
}

// Manipular upload de arquivos
function handleFileUpload(event) {
    const input = event.target;
    const item = input.dataset.upload;
    const section = input.closest('.section');
    const sectionId = section.id;
    
    if (!checklistData.uploads[sectionId]) {
        checklistData.uploads[sectionId] = {};
    }
    
    if (input.files.length > 0) {
        checklistData.uploads[sectionId][item] = input.files[0].name;
        
        // Atualizar UI para mostrar arquivo selecionado
        const uploadArea = input.closest('.upload-area');
        const fileName = uploadArea.querySelector('.file-name');
        if (fileName) {
            fileName.textContent = input.files[0].name;
            fileName.classList.remove('hidden');
        }
    }
}

// Manipular mudanças nos dados iniciais
function handleDataChange(event) {
    const input = event.target;
    const field = input.dataset.field;
    checklistData.dadosIniciais[field] = input.value;
}

// Mostrar seção específica
function showSection(sectionIndex) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Mostrar seção atual
    const sections = document.querySelectorAll('.section');
    if (sections[sectionIndex]) {
        sections[sectionIndex].classList.add('active');
        sections[sectionIndex].style.display = 'block';
    }
    
    currentSection = sectionIndex;
    updateStepIndicator();
}

// Próxima seção
function nextSection() {
    if (validateCurrentSection()) {
        if (currentSection < totalSections - 1) {
            showSection(currentSection + 1);
        }
    }
}

// Seção anterior
function prevSection() {
    if (currentSection > 0) {
        showSection(currentSection - 1);
    }
}

// Validar seção atual
function validateCurrentSection() {
    const currentSectionElement = document.querySelectorAll('.section')[currentSection];
    const requiredItems = currentSectionElement.querySelectorAll('[data-item]');
    
    for (let item of requiredItems) {
        const itemId = item.dataset.item;
        const sectionId = currentSectionElement.id;
        
        if (!checklistData.secoes[sectionId] || !checklistData.secoes[sectionId][itemId]) {
            alert('Por favor, complete todos os itens obrigatórios antes de continuar.');
            return false;
        }
    }
    
    return true;
}

// Atualizar indicador de etapas
function updateStepIndicator() {
    const steps = document.querySelectorAll('.step-indicator .step');
    steps.forEach((step, index) => {
        if (index <= currentSection) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Atualizar barra de progresso
function updateProgress() {
    const totalItems = document.querySelectorAll('[data-item]').length;
    let completedItems = 0;
    
    Object.values(checklistData.secoes).forEach(section => {
        completedItems += Object.keys(section).length;
    });
    
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    
    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
    
    if (progressText) {
        progressText.textContent = Math.round(progress) + '%';
    }
}

// Finalizar checklist
function finalizarChecklist() {
    if (validateAllSections()) {
        // Aqui você pode implementar o envio dos dados
        alert('Checklist finalizado com sucesso!');
        console.log('Dados do checklist:', checklistData);
    }
}

// Validar todas as seções
function validateAllSections() {
    const allItems = document.querySelectorAll('[data-item]');
    
    for (let item of allItems) {
        const itemId = item.dataset.item;
        const section = item.closest('.section');
        const sectionId = section.id;
        
        if (!checklistData.secoes[sectionId] || !checklistData.secoes[sectionId][itemId]) {
            alert('Por favor, complete todos os itens obrigatórios.');
            return false;
        }
    }
    
    return true;
}

// Exportar dados (opcional)
function exportarDados() {
    const dataStr = JSON.stringify(checklistData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'checklist_manutencao_' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
}