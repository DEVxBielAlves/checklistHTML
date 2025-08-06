/**
 * SISTEMA BASELL - Checklist Digital
 * Versão simplificada e funcional
 * Autor: Sistema Automatizado
 * Data: 2024
 */

// ========================================
// CONFIGURAÇÕES GLOBAIS
// ========================================
const CONFIG = {
  API_BASE_URL: "http://localhost:5001", // URL da API
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/webm",
  ],
  DEBOUNCE_DELAY: 300,
};

// ========================================
// ESTADO DA APLICAÇÃO
// ========================================
const AppState = {
  currentStep: "info", // 'info', 'step1', 'step2', 'step3'
  checklistData: {
    basicInfo: {
      nomeMotorista: "",
      placaVeiculo: "",
      dataExecucao: "",
    },
    step1Items: {}, // Itens 1-9
    step2Items: {}, // Itens 10-14 com mídia
    observations: {},
    mediaFiles: {},
  },
  isFormValid: false,
  isSaving: false,
};

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Sistema BASELL iniciado");
  console.log("🔍 [DEBUG] AppState ANTES de carregar localStorage:", JSON.stringify(AppState.checklistData.step1Items, null, 2));

  // CORREÇÃO: Limpar dados antigos do localStorage para evitar interferência
  clearOldChecklistData();
  
  // Garantir que step1Items inicie vazio
  AppState.checklistData.step1Items = {};
  console.log("🔍 [DEBUG] AppState APÓS limpeza:", JSON.stringify(AppState.checklistData.step1Items, null, 2));

  initializeApp();
});

// Função para limpar dados antigos do localStorage
function clearOldChecklistData() {
  console.log("🧹 [DEBUG] Limpando dados antigos do localStorage...");
  localStorage.removeItem("basell_checklist_json");
  localStorage.removeItem("basell_current_checklist_id");
  console.log("✅ [DEBUG] localStorage limpo");
}

// Função para adicionar botão de limpeza (para debug)
function addClearDataButton() {
  const header = document.querySelector(".bg-white.rounded-xl.shadow-lg.p-6.mb-6");
  if (header && !document.getElementById("clearDataBtn")) {
    const clearBtn = document.createElement("button");
    clearBtn.id = "clearDataBtn";
    clearBtn.className = "ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600";
    clearBtn.textContent = "🧹 Limpar Dados";
    clearBtn.onclick = function() {
      clearOldChecklistData();
      AppState.checklistData.step1Items = {};
      location.reload();
    };
    header.appendChild(clearBtn);
  }
}

function initializeApp() {
  try {
    console.log("🚀 [DEBUG] Inicializando aplicação...");
    console.log("🔍 [DEBUG] AppState inicial:", JSON.stringify(AppState, null, 2));
    
    setupCurrentDate();
    setupFormValidation();
    setupEventListeners();
    addClearDataButton(); // Adicionar botão de limpeza
    
    console.log("🔍 [DEBUG] Event listeners configurados");
    console.log("🔍 [DEBUG] Botões encontrados:", document.querySelectorAll(".status-btn").length);
    
    showNotification("Sistema carregado com sucesso!", "success");
  } catch (error) {
    console.error("❌ Erro na inicialização:", error);
    showNotification("Erro ao carregar o sistema", "error");
  }
}

// ========================================
// CONFIGURAÇÃO DE DATA ATUAL
// ========================================
function setupCurrentDate() {
  const dataInput = document.getElementById("dataExecucao");
  if (dataInput) {
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString("pt-BR");
    dataInput.value = dataFormatada;
    AppState.checklistData.basicInfo.dataExecucao = dataFormatada;
  }
}

// ========================================
// VALIDAÇÃO DE FORMULÁRIO
// ========================================
function setupFormValidation() {
  const nomeInput = document.getElementById("nomeMotorista");
  const placaInput = document.getElementById("placaVeiculo");
  const salvarBtn = document.getElementById("salvarInfoInicial");

  if (nomeInput && placaInput && salvarBtn) {
    // Validação em tempo real
    nomeInput.addEventListener(
      "input",
      debounce(validateBasicInfo, CONFIG.DEBOUNCE_DELAY)
    );
    placaInput.addEventListener(
      "input",
      debounce(validateBasicInfo, CONFIG.DEBOUNCE_DELAY)
    );

    // Formatação da placa
    placaInput.addEventListener("input", formatPlaca);

    // Evento de salvar
    salvarBtn.addEventListener("click", saveBasicInfo);
  }
}

function validateBasicInfo() {
  const nomeInput = document.getElementById("nomeMotorista");
  const placaInput = document.getElementById("placaVeiculo");
  const salvarBtn = document.getElementById("salvarInfoInicial");
  const statusIndicator = document.getElementById("indicadorStatus");
  const statusText = document.getElementById("textoStatus");

  const nome = nomeInput?.value.trim() || "";
  const placa = placaInput?.value.trim() || "";

  // Validação do nome (mínimo 3 caracteres)
  const nomeValido = nome.length >= 3;

  // Validação da placa (formato ABC-1234 ou ABC1234)
  const placaRegex = /^[A-Z]{3}-?\d{4}$/;
  const placaValida = placaRegex.test(placa.toUpperCase());

  // Atualizar classes visuais
  updateFieldValidation(nomeInput, nomeValido);
  updateFieldValidation(placaInput, placaValida);

  // Atualizar estado
  const isValid = nomeValido && placaValida;
  AppState.isFormValid = isValid;

  // Atualizar botão e status
  if (salvarBtn) {
    salvarBtn.disabled = !isValid;
  }

  if (statusIndicator && statusText) {
    if (isValid) {
      statusIndicator.className = "w-3 h-3 rounded-full bg-green-400 mr-2";
      statusText.textContent = "Informações válidas - Pronto para salvar";
    } else {
      statusIndicator.className = "w-3 h-3 rounded-full bg-red-400 mr-2";
      statusText.textContent = "Preencha as informações obrigatórias";
    }
  }

  // Salvar no estado
  AppState.checklistData.basicInfo.nomeMotorista = nome;
  AppState.checklistData.basicInfo.placaVeiculo = placa.toUpperCase();
}

function updateFieldValidation(field, isValid) {
  if (!field) return;

  field.classList.remove("campo-valido", "campo-invalido");
  if (field.value.trim()) {
    field.classList.add(isValid ? "campo-valido" : "campo-invalido");
  }
}

function formatPlaca(event) {
  let value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (value.length > 3) {
    value = value.substring(0, 3) + "-" + value.substring(3, 7);
  }
  event.target.value = value;
}

// ========================================
// GERENCIAMENTO DE EVENTOS
// ========================================
function setupEventListeners() {
  console.log("🔍 [DEBUG] Configurando event listeners...");
  
  // Remover todos os event listeners existentes dos botões de status
  const statusButtons = document.querySelectorAll(".status-btn");
  console.log("🔍 [DEBUG] Botões de status encontrados:", statusButtons.length);
  
  statusButtons.forEach((btn, index) => {
    // Remover listeners anteriores (incluindo do basell-redirect.js)
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    console.log(`🔍 [DEBUG] Configurando listener para botão ${index + 1}:`, {
      item: newBtn.dataset.item,
      status: newBtn.dataset.status,
      classes: newBtn.className
    });
    newBtn.addEventListener("click", handleItemSelection);
  });

  // Botões de mídia (Etapa 2)
  setupMediaButtons();

  // Botão de finalização
  const finalizeBtn = document.getElementById("finalizeBtn");
  if (finalizeBtn) {
    finalizeBtn.addEventListener("click", finalizeChecklist);
  }

  // Checkbox de confirmação final
  const finalConfirmation = document.getElementById("finalConfirmation");
  if (finalConfirmation) {
    finalConfirmation.addEventListener("change", updateFinalizeButton);
  }
  
  console.log("✅ [DEBUG] Event listeners configurados com sucesso");
}

// Função específica para configurar event listeners da Etapa 1
function setupStep1EventListeners() {
  console.log("🔍 [DEBUG] Configurando event listeners específicos da Etapa 1...");
  
  const statusButtons = document.querySelectorAll(".status-btn");
  console.log("🔍 [DEBUG] Botões de status encontrados na Etapa 1:", statusButtons.length);
  
  statusButtons.forEach((btn, index) => {
    // Remover listener anterior se existir
    btn.removeEventListener("click", handleItemSelection);
    
    console.log(`🔍 [DEBUG] Configurando listener para botão ${index + 1}:`, {
      item: btn.dataset.item,
      status: btn.dataset.status,
      classes: btn.className
    });
    
    btn.addEventListener("click", handleItemSelection);
  });
  
  console.log("✅ [DEBUG] Event listeners da Etapa 1 configurados com sucesso");
}

function handleItemSelection(event) {
  console.log("🔍 [DEBUG] === INÍCIO handleItemSelection ===");
  console.log("🔍 [DEBUG] Event recebido:", event);
  console.log("🔍 [DEBUG] Event target:", event.target);
  
  const btn = event.target.closest(".status-btn");
  if (!btn) {
    console.log("❌ [DEBUG] Botão .status-btn não encontrado!");
    console.log("❌ [DEBUG] Event target classes:", event.target.className);
    return;
  }

  const item = btn.dataset.item;
  const status = btn.dataset.status;
  
  console.log("🔍 [DEBUG] Botão encontrado:", btn);
  console.log("🔍 [DEBUG] Item:", item, "Status:", status);
  console.log("🔍 [DEBUG] Dataset completo:", btn.dataset);
  console.log("🔍 [DEBUG] AppState ANTES da alteração:", JSON.stringify(AppState.checklistData.step1Items, null, 2));
  console.log("🔍 [DEBUG] Quantidade de itens no AppState:", Object.keys(AppState.checklistData.step1Items).length);

  // Remover seleção anterior
  const container = btn.closest(".verification-item");
  container.querySelectorAll(".status-btn").forEach((b) => {
    b.classList.remove(
      "bg-green-100",
      "bg-red-100",
      "bg-yellow-100",
      "border-green-400",
      "border-red-400",
      "border-yellow-400"
    );
  });

  // Adicionar seleção atual
  btn.classList.add(
    status === "ok"
      ? "bg-green-100"
      : status === "not_ok"
      ? "bg-red-100"
      : "bg-yellow-100",
    status === "ok"
      ? "border-green-400"
      : status === "not_ok"
      ? "border-red-400"
      : "border-yellow-400"
  );

  // Converter status para formato do banco de dados
  const dbStatus =
    status === "ok"
      ? "Conforme"
      : status === "not_ok"
      ? "Não conforme"
      : "Não aplicável";

  console.log("🔍 [DEBUG] Status convertido para DB:", dbStatus);

  // Salvar no estado com o valor convertido
  AppState.checklistData.step1Items[item] = dbStatus;
  
  console.log("🔍 [DEBUG] AppState APÓS alteração:", JSON.stringify(AppState.checklistData.step1Items, null, 2));
  console.log("🔍 [DEBUG] Item específico salvo:", AppState.checklistData.step1Items[item]);
  console.log("🔍 [DEBUG] Total de itens salvos agora:", Object.keys(AppState.checklistData.step1Items).length);

  // Salvar dados como JSON no localStorage
  const saveResult = saveChecklistDataAsJSON();
  console.log("🔍 [DEBUG] Resultado do salvamento JSON:", saveResult);

  // Verificar se pode avançar para próxima etapa
  console.log("🔍 [DEBUG] Chamando checkStep1Completion()...");
  checkStep1Completion();
  console.log("🔍 [DEBUG] === FIM handleItemSelection ===");
}

function setupMediaButtons() {
  // Configurar inputs de arquivo
  for (let i = 10; i <= 14; i++) {
    const fileInput = document.getElementById(`fileInput${i}`);
    if (fileInput) {
      fileInput.addEventListener("change", (e) => handleMediaUpload(e, i));
      fileInput.style.display = "none"; // Esconder input padrão
    }
  }
}

// ========================================
// LÓGICA DE SALVAMENTO
// ========================================

// Salvar dados do checklist como JSON no localStorage
function saveChecklistDataAsJSON() {
  try {
    const checklistJSON = {
      basicInfo: AppState.checklistData.basicInfo,
      step1Items: AppState.checklistData.step1Items,
      step2Items: AppState.checklistData.step2Items,
      observations: AppState.checklistData.observations,
      mediaFiles: AppState.checklistData.mediaFiles,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(
      "basell_checklist_json",
      JSON.stringify(checklistJSON)
    );
    console.log("✅ Dados salvos como JSON no localStorage:", checklistJSON);
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar dados como JSON:", error);
    return false;
  }
}

// Carregar dados do checklist do localStorage (CORRIGIDO)
function loadChecklistDataFromJSON() {
  try {
    const savedData = localStorage.getItem("basell_checklist_json");
    if (savedData) {
      const checklistJSON = JSON.parse(savedData);

      // CORREÇÃO: Só restaurar basicInfo, NÃO step1Items para evitar dados antigos
      AppState.checklistData.basicInfo = checklistJSON.basicInfo || {};
      // AppState.checklistData.step1Items = checklistJSON.step1Items || {}; // REMOVIDO
      AppState.checklistData.step2Items = checklistJSON.step2Items || {};
      AppState.checklistData.observations = checklistJSON.observations || {};
      AppState.checklistData.mediaFiles = checklistJSON.mediaFiles || [];

      console.log("✅ Dados básicos carregados (step1Items mantido vazio):", checklistJSON);
      return checklistJSON;
    }
  } catch (error) {
    console.error("❌ Erro ao carregar dados do JSON:", error);
  }
  return null;
}

// Salvar dados no banco de dados com mapeamento correto
async function saveChecklistToDatabase(status = "nao_terminou") {
  try {
    console.log(
      "📊 Iniciando salvamento no banco de dados com status:",
      status
    );

    // Debug: Verificar dados antes do mapeamento
    console.log(
      "🔍 [DEBUG] AppState.checklistData.step1Items:",
      AppState.checklistData.step1Items
    );
    console.log(
      "🔍 [DEBUG] localStorage basell_checklist_json:",
      localStorage.getItem("basell_checklist_json")
    );
    console.log(
      "🔍 [DEBUG] AppState completo:",
      JSON.stringify(AppState.checklistData, null, 2)
    );

    // Preparar dados com mapeamento correto para as colunas da tabela
    const checklistRecord = {
      nomeMotorista: AppState.checklistData.basicInfo.nomeMotorista || "",
      placaVeiculo: AppState.checklistData.basicInfo.placaVeiculo || "",
      dataInspecao: new Date().toISOString().split("T")[0],
      status: status,

      // Mapear itens 1-9 para suas respectivas colunas
      item1: AppState.checklistData.step1Items["1"] || "Não aplicável",
      item1_observacoes: AppState.checklistData.observations?.["1"] || "",
      item2: AppState.checklistData.step1Items["2"] || "Não aplicável",
      item2_observacoes: AppState.checklistData.observations?.["2"] || "",
      item3: AppState.checklistData.step1Items["3"] || "Não aplicável",
      item3_observacoes: AppState.checklistData.observations?.["3"] || "",
      item4: AppState.checklistData.step1Items["4"] || "Não aplicável",
      item4_observacoes: AppState.checklistData.observations?.["4"] || "",
      item5: AppState.checklistData.step1Items["5"] || "Não aplicável",
      item5_observacoes: AppState.checklistData.observations?.["5"] || "",
      item6: AppState.checklistData.step1Items["6"] || "Não aplicável",
      item6_observacoes: AppState.checklistData.observations?.["6"] || "",
      item7: AppState.checklistData.step1Items["7"] || "Não aplicável",
      item7_observacoes: AppState.checklistData.observations?.["7"] || "",
      item8: AppState.checklistData.step1Items["8"] || "Não aplicável",
      item8_observacoes: AppState.checklistData.observations?.["8"] || "",
      item9: AppState.checklistData.step1Items["9"] || "Não aplicável",
      item9_observacoes: AppState.checklistData.observations?.["9"] || "",

      // Itens 10-14 com mídia (placeholder para etapa 2)
      item10_midia: JSON.stringify(
        AppState.checklistData.step2Items["10"]?.media || []
      ),
      item10_observacoes:
        AppState.checklistData.step2Items["10"]?.observacao || "",
      item11_midia: JSON.stringify(
        AppState.checklistData.step2Items["11"]?.media || []
      ),
      item11_observacoes:
        AppState.checklistData.step2Items["11"]?.observacao || "",
      item12_midia: JSON.stringify(
        AppState.checklistData.step2Items["12"]?.media || []
      ),
      item12_observacoes:
        AppState.checklistData.step2Items["12"]?.observacao || "",
      item13_midia: JSON.stringify(
        AppState.checklistData.step2Items["13"]?.media || []
      ),
      item13_observacoes:
        AppState.checklistData.step2Items["13"]?.observacao || "",
      item14_midia: JSON.stringify(
        AppState.checklistData.step2Items["14"]?.media || []
      ),
      item14_observacoes:
        AppState.checklistData.step2Items["14"]?.observacao || "",
    };

    // Debug: Log individual dos itens no objeto final
    console.log("🔍 [DEBUG] item1 no objeto final:", checklistRecord.item1);
    console.log("🔍 [DEBUG] item2 no objeto final:", checklistRecord.item2);
    console.log("🔍 [DEBUG] item3 no objeto final:", checklistRecord.item3);
    console.log("🔍 [DEBUG] item4 no objeto final:", checklistRecord.item4);
    console.log("🔍 [DEBUG] item5 no objeto final:", checklistRecord.item5);
    console.log("🔍 [DEBUG] item6 no objeto final:", checklistRecord.item6);
    console.log("🔍 [DEBUG] item7 no objeto final:", checklistRecord.item7);
    console.log("🔍 [DEBUG] item8 no objeto final:", checklistRecord.item8);
    console.log("🔍 [DEBUG] item9 no objeto final:", checklistRecord.item9);

    console.log("🌐 Enviando dados para API:", checklistRecord);

    // Enviar para a API
    const response = await fetch("http://localhost:5001/api/checklist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checklistRecord),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorData}`);
    }

    const savedRecord = await response.json();
    console.log("✅ Checklist salvo no banco de dados:", savedRecord);

    // Salvar ID do registro
    if (savedRecord.id) {
      AppState.checklistData.id = savedRecord.id;
      localStorage.setItem("basell_current_checklist_id", savedRecord.id);
    }

    return savedRecord;
  } catch (error) {
    console.error("❌ Erro ao salvar no banco de dados:", error);
    throw error;
  }
}

async function saveBasicInfo() {
  if (!AppState.isFormValid || AppState.isSaving) return;

  AppState.isSaving = true;
  const btn = document.getElementById("salvarInfoInicial");
  const originalText = btn.innerHTML;

  try {
    btn.innerHTML = '<span class="mr-1">⏳</span>Salvando...';
    btn.disabled = true;

    // Preparar dados no formato correto para o modelo do banco
    const dataToSave = {
      nomeMotorista: AppState.checklistData.basicInfo.nomeMotorista,
      placaVeiculo: AppState.checklistData.basicInfo.placaVeiculo,
      dataInspecao: new Date().toISOString().split("T")[0], // Data atual
    };

    // Salvar informações básicas via API
    const response = await saveToServer(
      "/api/checklist/basic-info",
      dataToSave
    );

    if (response && response.checklist) {
      // Salvar o ID do checklist criado
      AppState.checklistData.id = response.checklist.id;
    }

    showNotification("Informações salvas com sucesso!", "success");

    // Habilitar navegação para Etapa 1
    showStep("step1");
  } catch (error) {
    console.error("❌ Erro ao salvar:", error);
    showNotification("Erro ao salvar informações", "error");
  } finally {
    AppState.isSaving = false;
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function checkStep1Completion() {
  console.log("🔍 [DEBUG] === INICIANDO VALIDAÇÃO DA ETAPA 1 ===");
  
  // Verificar se TODAS as 9 perguntas específicas foram respondidas
  const requiredItems = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let allAnswered = true;
  let answeredCount = 0;
  
  console.log("🔍 [DEBUG] Itens obrigatórios:", requiredItems);
  console.log("🔍 [DEBUG] AppState.checklistData.step1Items completo:", JSON.stringify(AppState.checklistData.step1Items, null, 2));
  
  // Verificar se cada item obrigatório foi respondido
  for (const itemId of requiredItems) {
    const itemValue = AppState.checklistData.step1Items[itemId];
    console.log(`🔍 [DEBUG] Verificando item ${itemId}: valor = "${itemValue}", existe = ${!!itemValue}`);
    
    if (!itemValue) {
      allAnswered = false;
      console.log(`❌ [DEBUG] Item ${itemId} NÃO respondido`);
    } else {
      answeredCount++;
      console.log(`✅ [DEBUG] Item ${itemId} respondido com: "${itemValue}"`);
    }
  }
  
  console.log(`🔍 [DEBUG] Resultado da validação: ${answeredCount}/9 itens respondidos`);
  console.log(`🔍 [DEBUG] allAnswered = ${allAnswered}`);
  
  const nextStepBtn = document.getElementById('nextToStep2');
  console.log(`🔍 [DEBUG] Botão nextToStep2 encontrado: ${!!nextStepBtn}`);
  
  if (allAnswered) {
    console.log("✅ [DEBUG] TODOS OS ITENS RESPONDIDOS - HABILITANDO PRÓXIMA ETAPA");
    
    // Criar botão para próxima etapa se não existir
    createNextStepButton();
    
    // Habilitar botão se existir
    if (nextStepBtn) {
      nextStepBtn.disabled = false;
      nextStepBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      nextStepBtn.classList.add('hover:bg-blue-700');
    }
    
    showNotification(
      "Etapa 1 concluída! Você pode avançar para a Etapa 2.",
      "success"
    );
  } else {
    console.log(`❌ [DEBUG] ETAPA INCOMPLETA - Faltam ${9 - answeredCount} itens`);
    
    // Desabilitar botão se não todas as perguntas foram respondidas
    if (nextStepBtn) {
      nextStepBtn.disabled = true;
      nextStepBtn.classList.add('opacity-50', 'cursor-not-allowed');
      nextStepBtn.classList.remove('hover:bg-blue-700');
    }
    
    if (answeredCount > 0) {
      showNotification(
        `Etapa 1 incompleta! Faltam ${9 - answeredCount} itens para completar.`,
        "warning"
      );
    }
  }
  
  console.log(`🔍 [DEBUG] === FIM DA VALIDAÇÃO DA ETAPA 1 ===`);
  console.log(`🔍 Validação Etapa 1: ${answeredCount}/9 perguntas respondidas (${allAnswered ? 'COMPLETO' : 'INCOMPLETO'})`);
}

function createNextStepButton() {
  const section1 = document.getElementById("section1");
  if (!section1) {
    console.log("❌ Elemento section1 não encontrado");
    return;
  }

  const existingBtn = document.getElementById("nextToStep2");
  if (existingBtn) {
    console.log("✅ Botão nextToStep2 já existe");
    return; // Botão já existe
  }

  // Encontrar o container de navegação existente na section1
  const existingNavContainer = section1.querySelector(
    ".flex.justify-between.items-center"
  );
  if (!existingNavContainer) {
    console.log("❌ Container de navegação não encontrado em section1");
    return;
  }

  // Criar o botão "Próxima Etapa"
  const nextBtn = document.createElement("button");
  nextBtn.id = "nextToStep2";
  nextBtn.type = "button";
  nextBtn.className =
    "px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2";
  nextBtn.innerHTML = `
        <span>Próxima Etapa</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
    `;
  nextBtn.addEventListener("click", () => showStep("step2"));

  // Adicionar o botão ao container de navegação existente (ao lado do botão "Etapa Anterior")
  existingNavContainer.appendChild(nextBtn);

  console.log(
    "✅ Botão nextToStep2 criado com sucesso ao lado do botão Etapa Anterior"
  );
}

// ========================================
// NAVEGAÇÃO ENTRE SEÇÕES
// ========================================
function showStep(step) {
  // Salvar dados automaticamente antes de mudar de etapa
  saveChecklistDataAsJSON();

  // Se estiver saindo da etapa 1, salvar no banco de dados
  if (AppState.currentStep === 1 && step === "step2") {
    saveChecklistToDatabase("nao_terminou")
      .then(() => {
        console.log("✅ Dados da Etapa 1 salvos no banco de dados");
        showNotification("Dados da Etapa 1 salvos com sucesso!", "success");
      })
      .catch((error) => {
        console.error("❌ Erro ao salvar dados da Etapa 1:", error);
        showNotification("Erro ao salvar dados da Etapa 1", "error");
      });
  }

  // Esconder todas as seções
  document.querySelectorAll(".section").forEach((section) => {
    section.style.display = "none";
  });

  // Esconder container de info inicial
  const infoContainer = document.getElementById("infoInicialContainer");
  if (infoContainer) {
    infoContainer.style.display = step === "info" ? "block" : "none";
  }

  // Atualizar etapa atual
  switch (step) {
    case "step1":
      AppState.currentStep = 1;
      break;
    case "step2":
      AppState.currentStep = 2;
      break;
    case "step3":
      AppState.currentStep = 3;
      break;
  }

  // Mostrar seção correspondente
  let sectionId;
  switch (step) {
    case "step1":
      sectionId = "section1";
      break;
    case "step2":
      sectionId = "section2";
      break;
    case "step3":
      sectionId = "section4";
      populateStep3Summary();
      break;
    default:
      // Mostrar info inicial
      return;
  }

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = "block";
    targetSection.scrollIntoView({ behavior: "smooth" });
    
    // Reconfigurar event listeners quando a Etapa 1 for mostrada
    if (step === "step1") {
      console.log("🔍 [DEBUG] Reconfigurando event listeners para Etapa 1...");
      setTimeout(() => {
        setupStep1EventListeners();
      }, 100); // Pequeno delay para garantir que o DOM esteja atualizado
    }
  }

  AppState.currentStep = step;
}

function goToPreviousStep(currentStepNum) {
  switch (currentStepNum) {
    case 1:
      showStep("info");
      break;
    case 2:
      showStep("step1");
      break;
    case 3:
      showStep("step2");
      break;
  }
}

function goToNextStep(nextStepNum) {
  switch (nextStepNum) {
    case 2:
      showStep("step2");
      break;
    case 3:
      showStep("step3");
      break;
    default:
      console.warn("Etapa não reconhecida:", nextStepNum);
  }
}

// ========================================
// GERENCIAMENTO DE MÍDIA
// ========================================
function selectMedia(itemNumber, mediaType) {
  const fileInput = document.getElementById(`fileInput${itemNumber}`);
  if (fileInput) {
    fileInput.accept = mediaType === "photo" ? "image/*" : "video/*";
    fileInput.click();
  }
}

function handleMediaUpload(event, itemNumber) {
  // Verificar se event e event.target existem
  if (!event || !event.target || !event.target.files) {
    console.error("❌ Erro: event.target.files não está disponível");
    return;
  }

  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  // Validar arquivos
  const validFiles = files.filter((file) => {
    if (file.size > CONFIG.MAX_FILE_SIZE) {
      showNotification(
        `Arquivo ${file.name} é muito grande (máx: 10MB)`,
        "error"
      );
      return false;
    }
    if (!CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
      showNotification(`Tipo de arquivo ${file.name} não permitido`, "error");
      return false;
    }
    return true;
  });

  if (validFiles.length === 0) return;

  // Salvar arquivos no estado
  if (!AppState.checklistData.mediaFiles[itemNumber]) {
    AppState.checklistData.mediaFiles[itemNumber] = [];
  }
  AppState.checklistData.mediaFiles[itemNumber].push(...validFiles);

  // Mostrar preview
  displayMediaPreview(itemNumber, validFiles);

  // Verificar conclusão da Etapa 2
  checkStep2Completion();
}

function displayMediaPreview(itemNumber, files) {
  const previewContainer = document.getElementById(`mediaPreview${itemNumber}`);
  if (!previewContainer) return;

  files.forEach((file) => {
    const previewDiv = document.createElement("div");
    previewDiv.className =
      "inline-block mr-2 mb-2 p-2 bg-white border border-gray-300 rounded-lg";

    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.className = "w-20 h-20 object-cover rounded";
      previewDiv.appendChild(img);
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.className = "w-20 h-20 object-cover rounded";
      video.controls = true;
      previewDiv.appendChild(video);
    }

    const fileName = document.createElement("p");
    fileName.textContent =
      file.name.length > 15 ? file.name.substring(0, 15) + "..." : file.name;
    fileName.className = "text-xs text-gray-600 mt-1 text-center";
    previewDiv.appendChild(fileName);

    previewContainer.appendChild(previewDiv);
  });
}

// Variáveis globais para câmera
let currentStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let currentItemNumber = null;

// Função para iniciar a câmera
async function startCamera(itemNumber) {
  try {
    currentItemNumber = itemNumber;
    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "environment", // Câmera traseira por padrão
      },
      audio: true,
    };

    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoElement = document.getElementById(`cameraPreview${itemNumber}`);
    const cameraInterface = document.getElementById(
      `cameraInterface${itemNumber}`
    );

    if (videoElement && cameraInterface) {
      videoElement.srcObject = currentStream;
      cameraInterface.style.display = "block";

      // Scroll para a câmera
      cameraInterface.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } catch (error) {
    console.error("Erro ao acessar a câmera:", error);
    let errorMessage = "Erro ao acessar a câmera.";

    if (error.name === "NotAllowedError") {
      errorMessage =
        "Permissão de câmera negada. Por favor, permita o acesso à câmera.";
    } else if (error.name === "NotFoundError") {
      errorMessage = "Nenhuma câmera encontrada no dispositivo.";
    } else if (error.name === "NotSupportedError") {
      errorMessage = "Câmera não suportada neste navegador.";
    }

    alert(errorMessage);
  }
}

// Função para parar a câmera
function stopCamera(itemNumber) {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
    currentStream = null;
  }

  if (isRecording) {
    stopVideoRecording();
  }

  const cameraInterface = document.getElementById(
    `cameraInterface${itemNumber}`
  );
  if (cameraInterface) {
    cameraInterface.style.display = "none";
  }

  currentItemNumber = null;
}

// Função para capturar foto
function capturePhoto(itemNumber) {
  if (!currentStream) {
    alert("Câmera não está ativa.");
    return;
  }

  const videoElement = document.getElementById(`cameraPreview${itemNumber}`);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Definir dimensões do canvas baseado no vídeo
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  // Desenhar o frame atual do vídeo no canvas
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // Converter para blob
  canvas.toBlob(
    (blob) => {
      if (blob) {
        // Mostrar preview da foto capturada
        showMediaPreview(blob, itemNumber, "photo");
      }
    },
    "image/jpeg",
    0.8
  );
}

// Função para mostrar preview da mídia capturada
function showMediaPreview(blob, itemNumber, mediaType) {
  const cameraInterface = document.getElementById(
    `cameraInterface${itemNumber}`
  );

  // Criar container de preview
  const previewContainer = document.createElement("div");
  previewContainer.className =
    "media-preview-container bg-white p-4 rounded-lg border-2 border-blue-300 mt-4";
  previewContainer.id = `previewContainer${itemNumber}`;

  let mediaElement;
  if (mediaType === "photo") {
    mediaElement = document.createElement("img");
    mediaElement.src = URL.createObjectURL(blob);
    mediaElement.className = "w-full max-w-md mx-auto rounded-lg";
  } else {
    mediaElement = document.createElement("video");
    mediaElement.src = URL.createObjectURL(blob);
    mediaElement.controls = true;
    mediaElement.className = "w-full max-w-md mx-auto rounded-lg";
  }

  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "flex justify-center gap-3 mt-3";

  // Botão Confirmar
  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.className =
    "px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200";
  confirmBtn.innerHTML = "✅ Confirmar";
  confirmBtn.onclick = () => confirmMedia(blob, itemNumber, mediaType);

  // Botão Refazer
  const retakeBtn = document.createElement("button");
  retakeBtn.type = "button";
  retakeBtn.className =
    "px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-all duration-200";
  retakeBtn.innerHTML = "🔄 Refazer";
  retakeBtn.onclick = () => retakeMedia(itemNumber);

  // Botão Cancelar
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className =
    "px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-200";
  cancelBtn.innerHTML = "❌ Cancelar";
  cancelBtn.onclick = () => cancelMedia(itemNumber);

  buttonsContainer.appendChild(confirmBtn);
  buttonsContainer.appendChild(retakeBtn);
  buttonsContainer.appendChild(cancelBtn);

  previewContainer.appendChild(mediaElement);
  previewContainer.appendChild(buttonsContainer);

  // Esconder interface da câmera e mostrar preview
  cameraInterface.style.display = "none";
  cameraInterface.parentNode.appendChild(previewContainer);
}

// Função para confirmar mídia
async function confirmMedia(blob, itemNumber, mediaType) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `camera-${mediaType}-${itemNumber}-${timestamp}.${mediaType === "photo" ? "jpg" : "webm"}`;
    const fileType = mediaType === "photo" ? "image/jpeg" : "video/webm";

    // Criar arquivo simulado
    const file = new File([blob], fileName, { type: fileType });

    // Salvar no estado local
    if (!AppState.checklistData.mediaFiles[itemNumber]) {
      AppState.checklistData.mediaFiles[itemNumber] = [];
    }
    AppState.checklistData.mediaFiles[itemNumber].push(file);

    // Salvar no banco de dados
    await saveMediaToDatabase(file, itemNumber, mediaType);

    // Mostrar preview
    displayMediaPreview(itemNumber, [file]);

    // Fechar câmera e limpar preview
    stopCamera(itemNumber);
    cleanupPreview(itemNumber);

    // Verificar conclusão da Etapa 2
    checkStep2Completion();

    // Mostrar notificação de sucesso
    showNotification(
      `${mediaType === "photo" ? "Foto" : "Vídeo"} salvo com sucesso!`,
      "success"
    );
  } catch (error) {
    console.error("❌ Erro ao confirmar mídia:", error);
    showNotification(
      `Erro ao salvar ${mediaType === "photo" ? "foto" : "vídeo"}`,
      "error"
    );
  }
}

// Função para refazer mídia
function retakeMedia(itemNumber) {
  cleanupPreview(itemNumber);
  // Mostrar interface da câmera novamente
  const cameraInterface = document.getElementById(
    `cameraInterface${itemNumber}`
  );
  cameraInterface.style.display = "block";
}

// Função para cancelar mídia
function cancelMedia(itemNumber) {
  cleanupPreview(itemNumber);
  stopCamera(itemNumber);
}

// Função para limpar preview
function cleanupPreview(itemNumber) {
  const previewContainer = document.getElementById(
    `previewContainer${itemNumber}`
  );
  if (previewContainer) {
    previewContainer.remove();
  }
}

// Função para salvar mídia no banco de dados
async function saveMediaToDatabase(file, itemNumber, mediaType) {
  try {
    console.log(`📤 Enviando ${mediaType} para o servidor - Item ${itemNumber}`);
    
    // Criar FormData para envio do arquivo
    const formData = new FormData();
    formData.append('file', file);
    formData.append('itemNumber', itemNumber);
    formData.append('mediaType', mediaType);
    formData.append('checklistId', AppState.checklistData.id || '');
    formData.append('nomeMotorista', AppState.checklistData.basicInfo.nomeMotorista || '');
    formData.append('placaVeiculo', AppState.checklistData.basicInfo.placaVeiculo || '');
    
    // Enviar para o servidor
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/checklist/media`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorData}`);
    }
    
    const result = await response.json();
    console.log(`✅ Mídia salva no banco de dados:`, result);
    
    // Atualizar estado com informações do servidor
    if (!AppState.checklistData.step2Items[itemNumber]) {
      AppState.checklistData.step2Items[itemNumber] = {
        media: [],
        observacao: ''
      };
    }
    
    AppState.checklistData.step2Items[itemNumber].media.push({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      serverPath: result.filePath || '',
      mediaType: mediaType
    });
    
    // Salvar dados atualizados no localStorage
    saveChecklistDataAsJSON();
    
    return result;
  } catch (error) {
    console.error(`❌ Erro ao salvar ${mediaType} no banco de dados:`, error);
    throw error;
  }
}

// Função para alternar gravação de vídeo
function toggleVideoRecording(itemNumber) {
  if (!currentStream) {
    alert("Câmera não está ativa.");
    return;
  }

  if (!isRecording) {
    startVideoRecording(itemNumber);
  } else {
    stopVideoRecording();
  }
}

// Função para iniciar gravação de vídeo
function startVideoRecording(itemNumber) {
  try {
    recordedChunks = [];

    const options = {
      mimeType: "video/webm;codecs=vp9,opus",
    };

    // Fallback para diferentes navegadores
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = "video/webm;codecs=vp8,opus";
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = "video/webm";
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = "";
        }
      }
    }

    mediaRecorder = new MediaRecorder(currentStream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      // Mostrar preview do vídeo gravado
      showMediaPreview(blob, itemNumber, "video");
    };

    mediaRecorder.start();
    isRecording = true;

    // Atualizar botão
    const recordBtn = document.getElementById(`recordBtn${itemNumber}`);
    if (recordBtn) {
      recordBtn.innerHTML = "⏹️ Parar Gravação";
      recordBtn.style.backgroundColor = "#dc2626";
    }
  } catch (error) {
    console.error("Erro ao iniciar gravação:", error);
    alert("Erro ao iniciar gravação de vídeo.");
  }
}

// Função para parar gravação de vídeo
function stopVideoRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;

    // Atualizar botão
    const recordBtn = document.getElementById(`recordBtn${currentItemNumber}`);
    if (recordBtn) {
      recordBtn.innerHTML = "🎥 Gravar Vídeo";
      recordBtn.style.backgroundColor = "";
    }
  }
}

function checkStep2Completion() {
  const requiredItems = [10, 11, 12, 13, 14];
  let allComplete = true;

  requiredItems.forEach((itemNumber) => {
    const mediaFiles =
      AppState.checklistData.mediaFiles[itemNumber] || [];
    if (mediaFiles.length === 0) {
      allComplete = false;
    }
  });

  // Habilitar/desabilitar botão de próxima etapa
  const nextBtn = document.getElementById("nextToStep3Btn");
  if (nextBtn) {
    nextBtn.disabled = !allComplete;
    if (allComplete) {
      nextBtn.classList.remove("opacity-50", "cursor-not-allowed");
      nextBtn.classList.add("hover:shadow-lg");
      nextBtn.title =
        "Todas as mídias foram enviadas. Clique para ir para a etapa final.";
      showNotification(
        "Etapa 2 concluída! Você pode avançar para a finalização.",
        "success"
      );
    } else {
      nextBtn.classList.add("opacity-50", "cursor-not-allowed");
      nextBtn.classList.remove("hover:shadow-lg");
      nextBtn.title =
        "Envie mídia para todos os itens (10-14) antes de prosseguir.";
    }
  }

  return allComplete;
}

// ========================================
// FINALIZAÇÃO DO CHECKLIST
// ========================================
function populateStep3Summary() {
  // Resumo das informações básicas
  const basicInfoSummary = document.getElementById("basicInfoSummary");
  if (basicInfoSummary) {
    basicInfoSummary.innerHTML = `
            <div class="bg-white p-3 rounded-lg border border-blue-200">
                <p class="font-semibold text-blue-800">Motorista</p>
                <p class="text-gray-700">${AppState.checklistData.basicInfo.nomeMotorista}</p>
            </div>
            <div class="bg-white p-3 rounded-lg border border-blue-200">
                <p class="font-semibold text-blue-800">Placa</p>
                <p class="text-gray-700">${AppState.checklistData.basicInfo.placaVeiculo}</p>
            </div>
            <div class="bg-white p-3 rounded-lg border border-blue-200">
                <p class="font-semibold text-blue-800">Data</p>
                <p class="text-gray-700">${AppState.checklistData.basicInfo.dataExecucao}</p>
            </div>
        `;
  }

  // Resumo das verificações (Etapa 1)
  const questionsSummary = document.getElementById("questionsSummary");
  if (questionsSummary) {
    let html = "";
    for (let i = 1; i <= 9; i++) {
      const status = AppState.checklistData.step1Items[i] || "Não aplicável";
      const statusText = status; // Status já está no formato correto
      const statusColor =
        status === "Conforme"
          ? "text-green-600"
          : status === "Não conforme"
          ? "text-red-600"
          : "text-yellow-600";

      html += `
                <div class="bg-white p-3 rounded-lg border border-yellow-200">
                    <p class="font-semibold text-yellow-800">Item ${i}</p>
                    <p class="${statusColor}">${statusText}</p>
                </div>
            `;
    }
    questionsSummary.innerHTML = html;
  }

  // Resumo das mídias (Etapa 2)
  const mediaSummary = document.getElementById("mediaSummary");
  if (mediaSummary) {
    let html = "";
    for (let i = 10; i <= 14; i++) {
      const mediaCount = AppState.checklistData.mediaFiles[i]?.length || 0;

      html += `
                <div class="bg-white p-3 rounded-lg border border-purple-200">
                    <p class="font-semibold text-purple-800">Item ${i}</p>
                    <p class="text-gray-700">${mediaCount} arquivo(s) enviado(s)</p>
                </div>
            `;
    }
    mediaSummary.innerHTML = html;
  }
}

function updateFinalizeButton() {
  const checkbox = document.getElementById("finalConfirmation");
  const finalizeBtn = document.getElementById("finalizeBtn");

  if (checkbox && finalizeBtn) {
    finalizeBtn.disabled = !checkbox.checked;
  }
}

async function finalizeChecklist() {
  const finalizeBtn = document.getElementById("finalizeBtn");
  if (!finalizeBtn || finalizeBtn.disabled) return;

  const originalText = finalizeBtn.innerHTML;

  try {
    finalizeBtn.innerHTML = '<span class="mr-2">⏳</span>Finalizando...';
    finalizeBtn.disabled = true;

    // Atualizar status para finalizado
    AppState.checklistData.status = 'finalizado';
    AppState.checklistData.dataFinalizacao = new Date().toISOString();

    // Salvar checklist completo com status finalizado
    await saveToServer("/api/basell-checklist", AppState.checklistData);

    // Atualizar status no banco de dados
    await updateChecklistStatus(AppState.checklistData.checklistId, 'finalizado');

    showNotification("Checklist finalizado com sucesso!", "success");

    // Redirecionar ou mostrar tela de sucesso
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 2000);
  } catch (error) {
    console.error("❌ Erro ao finalizar:", error);
    showNotification("Erro ao finalizar checklist", "error");
    finalizeBtn.innerHTML = originalText;
    finalizeBtn.disabled = false;
  }
}

// ========================================
// FUNÇÕES DE SERVIDOR E ORM
// ========================================
async function saveToServer(endpoint, data) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Erro na comunicação com servidor:", error);
    // Simular sucesso para desenvolvimento
    console.log("📝 Dados que seriam salvos:", data);
    return {
      success: true,
      message: "Dados salvos localmente (modo desenvolvimento)",
    };
  }
}

async function updateChecklistStatus(checklistId, status) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/basell-checklist/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checklistId: checklistId,
        status: status,
        dataFinalizacao: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Status do checklist atualizado:", result);
    return result;
  } catch (error) {
    console.error("❌ Erro ao atualizar status do checklist:", error);
    // Simular sucesso para desenvolvimento
    console.log("📝 Status que seria atualizado:", { checklistId, status });
    return {
      success: true,
      message: "Status atualizado localmente (modo desenvolvimento)",
    };
  }
}

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showNotification(message, type = "info") {
  // Criar elemento de notificação
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
      ? "bg-red-500 text-white"
      : type === "warning"
      ? "bg-yellow-500 text-black"
      : "bg-blue-500 text-white"
  }`;

  notification.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2">${
              type === "success"
                ? "✅"
                : type === "error"
                ? "❌"
                : type === "warning"
                ? "⚠️"
                : "ℹ️"
            }</span>
            <span>${message}</span>
        </div>
    `;

  document.body.appendChild(notification);

  // Remover após 3 segundos
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// ========================================
// FUNÇÕES DE TESTE (DESENVOLVIMENTO)
// ========================================
function testarEtapa3() {
  // Preencher dados de teste
  AppState.checklistData.basicInfo = {
    nomeMotorista: "João Silva",
    placaVeiculo: "ABC-1234",
    dataExecucao: new Date().toLocaleDateString("pt-BR"),
  };

  // Simular itens da Etapa 1
  for (let i = 1; i <= 9; i++) {
    AppState.checklistData.step1Items[i] =
      i % 3 === 0 ? "ok" : i % 3 === 1 ? "not_ok" : "na";
  }

  // Simular mídias da Etapa 2
  for (let i = 10; i <= 14; i++) {
    AppState.checklistData.mediaFiles[i] = [
      { name: `teste_${i}.jpg`, size: 1024 },
    ];
  }

  showStep("step3");
  showNotification("Dados de teste carregados para Etapa 3", "info");
}

// ========================================
// EXPORTAR FUNÇÕES GLOBAIS
// ========================================
window.BasellSystem = {
  showStep,
  goToPreviousStep,
  selectMedia,
  testarEtapa3,
  saveBasicInfo,
  finalizeChecklist,
  AppState,
};

// Tornar funções disponíveis globalmente para compatibilidade com HTML
window.showStep = showStep;
window.goToPreviousStep = goToPreviousStep;
window.selectMedia = selectMedia;
window.testarEtapa3 = testarEtapa3;

console.log("✅ Sistema BASELL carregado e pronto para uso!");
