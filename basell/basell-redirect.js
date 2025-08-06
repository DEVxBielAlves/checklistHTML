// Sistema BASELL - Checklist Digital (Versão com Redirecionamento)
// Funcionalidades de validação e controle do formulário com navegação por páginas

// Nota: checklistData é declarado em basell.js
// Variáveis globais
let currentStep = 1;

let step2Data = {
  items: {
    10: { status: "", observacao: "", media: [] },
    11: { status: "", observacao: "", media: [] },
    12: { status: "", observacao: "", media: [] },
    13: { status: "", observacao: "", media: [] },
    14: { status: "", observacao: "", media: [] },
  },
};

// Inicialização quando a página carrega
document.addEventListener("DOMContentLoaded", function () {
  initializeRedirectSystem();
  // Não carregar dados automaticamente - apenas configurar funcionalidades
  setupPageSpecificFunctions();
});

// Inicializar sistema de redirecionamento
function initializeRedirectSystem() {
  console.log("🚀 Sistema BASELL - Inicializando sistema de redirecionamento");

  // Detectar página atual
  const currentPage = getCurrentPage();
  console.log(`📄 Página atual detectada: ${currentPage}`);

  // Configurar funcionalidades específicas da página
  switch (currentPage) {
    case "index":
      setupIndexPage();
      break;
    case "etapa1":
      setupEtapa1Page();
      break;
    case "etapa2":
      setupEtapa2Page();
      break;
    case "etapa3":
      setupEtapa3Page();
      break;
    default:
      console.log("📄 Página não reconhecida, usando configuração padrão");
  }
}

// Detectar página atual
function getCurrentPage() {
  const path = window.location.pathname;
  const filename = path.split("/").pop().toLowerCase();

  if (filename.includes("index") || filename === "" || filename === "/") {
    return "index";
  } else if (filename.includes("etapa1")) {
    return "etapa1";
  } else if (filename.includes("etapa2")) {
    return "etapa2";
  } else if (filename.includes("etapa3")) {
    return "etapa3";
  }

  return "unknown";
}

// Configurar página inicial (index.html)
function setupIndexPage() {
  console.log("🏠 Configurando página inicial");
  // Funcionalidades já estão no index.html
}

// Configurar Etapa 1
function setupEtapa1Page() {
  console.log("1️⃣ Configurando Etapa 1");

  // Limpar dados anteriores ao iniciar novo checklist
  clearPreviousData();

  // Configurar validação dos campos
  setupEtapa1Validation();

  // Configurar botões dos itens
  setupEtapa1ItemButtons();

  // Configurar botão de próxima etapa
  setupEtapa1NextButton();

  // Configurar data atual
  setCurrentDate();

  // Não popular campos automaticamente - deixar em branco para novo checklist
}

// Configurar Etapa 2
function setupEtapa2Page() {
  console.log("2️⃣ Configurando Etapa 2");

  // Carregar dados salvos apenas para verificação
  loadDataFromStorage();

  // Verificar se dados da Etapa 1 existem
  if (!checklistData.nomeMotorista || !checklistData.placaVeiculo) {
    alert("Dados da Etapa 1 não encontrados. Redirecionando para o início.");
    window.location.href = "etapa1.html";
    return;
  }

  // Configurar funcionalidades da Etapa 2
  setupEtapa2Functions();

  // Popular dados básicos no cabeçalho
  populateEtapa2Header();
}

// Configurar Etapa 3
function setupEtapa3Page() {
  console.log("3️⃣ Configurando Etapa 3");

  // Carregar dados salvos apenas para verificação
  loadDataFromStorage();

  // Verificar se dados das etapas anteriores existem
  if (!checklistData.nomeMotorista || !step2Data.items) {
    alert(
      "Dados das etapas anteriores não encontrados. Redirecionando para o início."
    );
    window.location.href = "index.html";
    return;
  }

  // Configurar funcionalidades da Etapa 3
  setupEtapa3Functions();
}

// Carregar dados do localStorage
function loadDataFromStorage() {
  try {
    const savedChecklistData = localStorage.getItem("basell_checklistData");
    const savedStep2Data = localStorage.getItem("basell_step2Data");

    if (savedChecklistData) {
      checklistData = JSON.parse(savedChecklistData);
      console.log(
        "✅ Dados da Etapa 1 carregados do localStorage:",
        checklistData
      );
    }

    if (savedStep2Data) {
      step2Data = JSON.parse(savedStep2Data);
      console.log("✅ Dados da Etapa 2 carregados do localStorage:", step2Data);
    }

    return true;
  } catch (error) {
    console.error("❌ Erro ao carregar dados do localStorage:", error);
    return false;
  }
}

// Salvar dados no localStorage
function saveDataToStorage() {
  try {
    localStorage.setItem("basell_checklistData", JSON.stringify(checklistData));
    localStorage.setItem("basell_step2Data", JSON.stringify(step2Data));
    console.log("✅ Dados salvos no localStorage");
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar dados no localStorage:", error);
    return false;
  }
}

// Limpar dados anteriores do localStorage
function clearPreviousData() {
  try {
    localStorage.removeItem("basell_checklistData");
    localStorage.removeItem("basell_step2Data");

    // Resetar variáveis globais
    checklistData = {
      nomeMotorista: "",
      placaVeiculo: "",
      dataExecucao: "",
      items: {},
    };

    step2Data = {
      items: {
        10: { status: "", observacao: "", media: [] },
        11: { status: "", observacao: "", media: [] },
        12: { status: "", observacao: "", media: [] },
        13: { status: "", observacao: "", media: [] },
        14: { status: "", observacao: "", media: [] },
      },
    };

    console.log("🧹 Dados anteriores limpos - novo checklist iniciado");
    return true;
  } catch (error) {
    console.error("❌ Erro ao limpar dados anteriores:", error);
    return false;
  }
}

// Enviar dados para o servidor
async function sendDataToServer(data, endpoint) {
  try {
    const response = await fetch(`http://localhost:5001/api/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Dados enviados com sucesso:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Erro ao enviar dados para o servidor:", error);
    return { success: false, error: error.message };
  }
}

// Salvar checklist completo no banco de dados
async function saveChecklistToDatabase() {
  try {
    // Preparar dados completos do checklist
    const completeData = {
      nomeMotorista: checklistData.nomeMotorista,
      placaVeiculo: checklistData.placaVeiculo,
      dataExecucao: checklistData.dataExecucao,
      etapa1Items: checklistData.items,
      etapa2Items: step2Data.items,
      status: "completo",
      timestamp: new Date().toISOString(),
    };

    // Enviar para o servidor
    const result = await sendDataToServer(completeData, "checklist/basell");

    if (result.success) {
      showSuccessMessage("Checklist salvo com sucesso no banco de dados!");
      // Limpar localStorage após salvar no banco
      clearPreviousData();
      return true;
    } else {
      showErrorMessage("Erro ao salvar checklist: " + result.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Erro ao salvar checklist no banco:", error);
    showErrorMessage("Erro interno ao salvar checklist");
    return false;
  }
}

// Mostrar mensagem de sucesso
function showSuccessMessage(message) {
  const alertDiv = document.createElement("div");
  alertDiv.className =
    "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
  alertDiv.innerHTML = `
    <div class="flex items-center space-x-2">
      <span>✅</span>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Mostrar mensagem de erro
function showErrorMessage(message) {
  const alertDiv = document.createElement("div");
  alertDiv.className =
    "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
  alertDiv.innerHTML = `
    <div class="flex items-center space-x-2">
      <span>❌</span>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Configurar validação da Etapa 1
function setupEtapa1Validation() {
  const nomeMotoristaInput = document.getElementById("nomeMotorista");
  const placaVeiculoInput = document.getElementById("placaVeiculo");
  const salvarBtn = document.getElementById("salvarInfoInicial");

  if (!nomeMotoristaInput || !placaVeiculoInput || !salvarBtn) {
    console.log(
      "⚠️ Elementos da Etapa 1 não encontrados, pulando configuração"
    );
    return;
  }

  // Adicionar event listeners para validação em tempo real
  nomeMotoristaInput.addEventListener("input", validateEtapa1Inputs);
  nomeMotoristaInput.addEventListener("blur", validateEtapa1Inputs);

  placaVeiculoInput.addEventListener("input", function () {
    formatPlaca(this);
    validateEtapa1Inputs();
  });
  placaVeiculoInput.addEventListener("blur", validateEtapa1Inputs);

  // Event listener para o botão salvar
  salvarBtn.addEventListener("click", salvarInformacoesIniciais);
}

// Configurar botões dos itens da Etapa 1
function setupEtapa1ItemButtons() {
  const statusButtons = document.querySelectorAll(".status-btn");

  statusButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const itemNumber = this.getAttribute("data-item");
      const status = this.getAttribute("data-status");

      if (itemNumber >= 1 && itemNumber <= 9) {
        handleEtapa1ItemSelection(itemNumber, status, this);
      }
    });
  });
}

// Configurar botão de próxima etapa da Etapa 1
function setupEtapa1NextButton() {
  const nextStepBtn = document.getElementById("nextStepBtn");

  if (nextStepBtn) {
    nextStepBtn.addEventListener("click", function (e) {
      e.preventDefault();
      goToEtapa2();
    });
  }
}

// Gerenciar seleção de itens da Etapa 1
function handleEtapa1ItemSelection(itemNumber, status, clickedButton) {
  // Encontrar todos os botões do mesmo item
  const itemButtons = document.querySelectorAll(`[data-item="${itemNumber}"]`);

  // Remover seleção de todos os botões do item
  itemButtons.forEach((btn) => {
    btn.classList.remove("selected-ok", "selected-not-ok", "selected-na");

    // Restaurar cores originais
    if (btn.getAttribute("data-status") === "ok") {
      btn.classList.remove("bg-green-600", "text-white", "border-green-600");
      btn.classList.add("bg-white", "border-green-200", "text-green-700");
    } else if (btn.getAttribute("data-status") === "not_ok") {
      btn.classList.remove("bg-red-600", "text-white", "border-red-600");
      btn.classList.add("bg-white", "border-red-200", "text-red-700");
    } else if (btn.getAttribute("data-status") === "na") {
      btn.classList.remove("bg-yellow-600", "text-white", "border-yellow-600");
      btn.classList.add("bg-white", "border-yellow-200", "text-yellow-700");
    }
  });

  // Aplicar estilo selecionado ao botão clicado
  if (status === "ok") {
    clickedButton.classList.remove(
      "bg-white",
      "border-green-200",
      "text-green-700"
    );
    clickedButton.classList.add(
      "bg-green-600",
      "text-white",
      "border-green-600",
      "selected-ok"
    );
  } else if (status === "not_ok") {
    clickedButton.classList.remove(
      "bg-white",
      "border-red-200",
      "text-red-700"
    );
    clickedButton.classList.add(
      "bg-red-600",
      "text-white",
      "border-red-600",
      "selected-not-ok"
    );
  } else if (status === "na") {
    clickedButton.classList.remove(
      "bg-white",
      "border-yellow-200",
      "text-yellow-700"
    );
    clickedButton.classList.add(
      "bg-yellow-600",
      "text-white",
      "border-yellow-600",
      "selected-na"
    );
  }

  // Salvar seleção nos dados do checklist
  checklistData.items[`item${itemNumber}`] = status;

  // Salvar no localStorage
  saveDataToStorage();

  // Feedback visual
  clickedButton.style.transform = "scale(0.95)";
  setTimeout(() => {
    clickedButton.style.transform = "scale(1)";
  }, 150);

  console.log(`Item ${itemNumber} selecionado: ${status}`);

  // Verificar se todos os itens foram preenchidos
  checkEtapa1Completion();
}

// Verificar se a Etapa 1 está completa
function checkEtapa1Completion() {
  const requiredItems = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let allAnswered = true;
  
  // Verificar se cada item obrigatório foi respondido
  for (const itemId of requiredItems) {
    if (!checklistData.items || !checklistData.items[`item${itemId}`]) {
      allAnswered = false;
      break;
    }
  }

  const nextStepBtn = document.getElementById("nextStepBtn");

  if (allAnswered && nextStepBtn) {
    nextStepBtn.disabled = false;
    nextStepBtn.classList.remove("opacity-50", "cursor-not-allowed");
    nextStepBtn.classList.add("hover:bg-blue-700");
    console.log(`✅ Etapa 1 completa - ${Object.keys(checklistData.items || {}).length}/9 itens respondidos`);
  } else if (nextStepBtn) {
    nextStepBtn.disabled = true;
    nextStepBtn.classList.add("opacity-50", "cursor-not-allowed");
    nextStepBtn.classList.remove("hover:bg-blue-700");
    console.log(`❌ Etapa 1 incompleta - ${Object.keys(checklistData.items || {}).length}/9 itens respondidos`);
  }
}

// Validar campos da Etapa 1
function validateEtapa1Inputs() {
  const nomeMotorista = document.getElementById("nomeMotorista").value.trim();
  const placaVeiculo = document.getElementById("placaVeiculo").value.trim();
  const salvarBtn = document.getElementById("salvarInfoInicial");

  const nomeValido = nomeMotorista.length >= 3;
  const placaRegex = /^[A-Z]{3}-?[0-9]{4}$/;
  const placaValida = placaRegex.test(placaVeiculo.toUpperCase());

  if (nomeValido && placaValida && salvarBtn) {
    salvarBtn.disabled = false;
    salvarBtn.classList.remove("opacity-50", "cursor-not-allowed");
  } else if (salvarBtn) {
    salvarBtn.disabled = true;
    salvarBtn.classList.add("opacity-50", "cursor-not-allowed");
  }
}

// Formatar placa automaticamente
function formatPlaca(input) {
  let value = input.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  if (value.length > 3) {
    value = value.substring(0, 3) + "-" + value.substring(3, 7);
  }

  input.value = value;
}

// Configurar data atual
function setCurrentDate() {
  const dataExecucaoInput = document.getElementById("dataExecucao");

  if (dataExecucaoInput) {
    const now = new Date();
    const dateString =
      now.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " às " +
      now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

    dataExecucaoInput.value = dateString;
    checklistData.dataExecucao = dateString;
  }
}

// Popular campos da Etapa 1 com dados salvos
function populateEtapa1Fields() {
  if (checklistData.nomeMotorista) {
    const nomeInput = document.getElementById("nomeMotorista");
    if (nomeInput) {
      nomeInput.value = checklistData.nomeMotorista;
    }
  }

  if (checklistData.placaVeiculo) {
    const placaInput = document.getElementById("placaVeiculo");
    if (placaInput) {
      placaInput.value = checklistData.placaVeiculo;
    }
  }

  // Popular seleções dos itens
  Object.keys(checklistData.items).forEach((itemKey) => {
    const itemNumber = itemKey.replace("item", "");
    const status = checklistData.items[itemKey];
    const button = document.querySelector(
      `[data-item="${itemNumber}"][data-status="${status}"]`
    );

    if (button) {
      handleEtapa1ItemSelection(itemNumber, status, button);
    }
  });
}

// Salvar informações iniciais
function salvarInformacoesIniciais() {
  const nomeMotorista = document.getElementById("nomeMotorista").value.trim();
  const placaVeiculo = document.getElementById("placaVeiculo").value.trim();

  checklistData.nomeMotorista = nomeMotorista;
  checklistData.placaVeiculo = placaVeiculo.toUpperCase();

  // Salvar no localStorage
  saveDataToStorage();

  // Feedback visual
  const salvarBtn = document.getElementById("salvarInfoInicial");
  const originalText = salvarBtn.innerHTML;

  salvarBtn.innerHTML = "✅ Informações Salvas!";
  salvarBtn.classList.add("bg-green-600");

  setTimeout(() => {
    salvarBtn.innerHTML = originalText;
    salvarBtn.classList.remove("bg-green-600");
  }, 2000);

  console.log("✅ Informações iniciais salvas:", checklistData);
}

// Navegar para Etapa 2
async function goToEtapa2() {
  console.log("🔄 Navegando para Etapa 2...");

  try {
    // Salvar dados antes de navegar
    saveDataToStorage();

    // Salvar no banco de dados
    console.log("💾 Iniciando salvamento no banco de dados...");
    await saveChecklistToDatabase("nao_terminou");
    console.log("✅ Dados salvos no banco com sucesso");

    // Redirecionar
    window.location.href = "etapa2.html";
  } catch (error) {
    console.error("❌ Erro ao salvar no banco:", error);
    // Continuar mesmo com erro no banco
    console.warn("⚠️ Continuando sem salvar no banco...");
    window.location.href = "etapa2.html";
  }
}

// Navegar para Etapa 3
function goToEtapa3() {
  console.log("🔄 Navegando para Etapa 3...");

  // Salvar dados antes de navegar
  saveDataToStorage();

  // Redirecionar
  window.location.href = "etapa3.html";
}

// Voltar para página anterior
function goToPreviousPage() {
  const currentPage = getCurrentPage();

  switch (currentPage) {
    case "etapa2":
      window.location.href = "etapa1.html";
      break;
    case "etapa3":
      window.location.href = "etapa2.html";
      break;
    default:
      window.location.href = "index.html";
  }
}

// Configurar funcionalidades específicas da página
function setupPageSpecificFunctions() {
  // Esta função será expandida conforme necessário
  console.log("🔧 Configurando funcionalidades específicas da página");
}

// Configurar funcionalidades da Etapa 2
function setupEtapa2Functions() {
  console.log("🔧 Configurando funcionalidades da Etapa 2");
  // As funcionalidades específicas da Etapa 2 já estão implementadas no etapa2.html
}

// Configurar funcionalidades da Etapa 3
function setupEtapa3Functions() {
  console.log("🔧 Configurando funcionalidades da Etapa 3");
  // As funcionalidades específicas da Etapa 3 já estão implementadas no etapa3.html
}

// Popular cabeçalho da Etapa 2
function populateEtapa2Header() {
  const nomeElement = document.getElementById("headerNomeMotorista");
  const placaElement = document.getElementById("headerPlacaVeiculo");
  const dataElement = document.getElementById("headerDataExecucao");

  if (nomeElement && checklistData.nomeMotorista) {
    nomeElement.textContent = checklistData.nomeMotorista;
  }

  if (placaElement && checklistData.placaVeiculo) {
    placaElement.textContent = checklistData.placaVeiculo;
  }

  if (dataElement && checklistData.dataExecucao) {
    dataElement.textContent = checklistData.dataExecucao;
  }
}

// Mostrar mensagem de sucesso
function showSuccessMessage(message) {
  const notification = document.createElement("div");
  notification.className =
    "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300";
  notification.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
      <span class="font-semibold">${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.remove("translate-x-full");
  }, 100);

  setTimeout(() => {
    notification.classList.add("translate-x-full");
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Mostrar mensagem de erro
function showErrorMessage(message) {
  const notification = document.createElement("div");
  notification.className =
    "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300";
  notification.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
      </svg>
      <span class="font-semibold">${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.remove("translate-x-full");
  }, 100);

  setTimeout(() => {
    notification.classList.add("translate-x-full");
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Função para salvar dados no banco de dados via API REST
async function saveChecklistToDatabase(status = "nao_terminou") {
  try {
    console.log(
      "📊 [saveChecklistToDatabase] Iniciando salvamento com status:",
      status
    );
    console.log(
      "📊 [saveChecklistToDatabase] Dados checklistData:",
      checklistData
    );

    // Preparar dados para salvamento
    const checklistRecord = {
      nomeMotorista: checklistData.nomeMotorista || "",
      placaVeiculo: checklistData.placaVeiculo || "",
      status: status,

      // Itens 1-9: Verificações básicas
      item1: mapStatusToEnum(checklistData.items?.item1),
      item1_observacoes: checklistData.observacoes?.item1 || "",
      item2: mapStatusToEnum(checklistData.items?.item2),
      item2_observacoes: checklistData.observacoes?.item2 || "",
      item3: mapStatusToEnum(checklistData.items?.item3),
      item3_observacoes: checklistData.observacoes?.item3 || "",
      item4: mapStatusToEnum(checklistData.items?.item4),
      item4_observacoes: checklistData.observacoes?.item4 || "",
      item5: mapStatusToEnum(checklistData.items?.item5),
      item5_observacoes: checklistData.observacoes?.item5 || "",
      item6: mapStatusToEnum(checklistData.items?.item6),
      item6_observacoes: checklistData.observacoes?.item6 || "",
      item7: mapStatusToEnum(checklistData.items?.item7),
      item7_observacoes: checklistData.observacoes?.item7 || "",
      item8: mapStatusToEnum(checklistData.items?.item8),
      item8_observacoes: checklistData.observacoes?.item8 || "",
      item9: mapStatusToEnum(checklistData.items?.item9),
      item9_observacoes: checklistData.observacoes?.item9 || "",

      // Itens 10-14: Placeholder para mídias (serão preenchidos na etapa 2)
      item10_midia: JSON.stringify([]),
      item10_observacoes: "",
      item11_midia: JSON.stringify([]),
      item11_observacoes: "",
      item12_midia: JSON.stringify([]),
      item12_observacoes: "",
      item13_midia: JSON.stringify([]),
      item13_observacoes: "",
      item14_midia: JSON.stringify([]),
      item14_observacoes: "",
    };

    console.log(
      "🌐 [saveChecklistToDatabase] Enviando checklist para API:",
      checklistRecord
    );

    // Enviar dados para a API REST
    console.log(
      "🌐 [saveChecklistToDatabase] Fazendo requisição POST para http://localhost:5001/api/checklist"
    );

    try {
      const response = await fetch("http://localhost:5001/api/checklist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checklistRecord),
      });

      console.log(
        "🌐 [saveChecklistToDatabase] Resposta recebida. Status:",
        response.status
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error(
          "❌ [saveChecklistToDatabase] Erro na resposta da API:",
          errorData
        );
        throw new Error(`Erro HTTP ${response.status}: ${errorData}`);
      }

      const savedRecord = await response.json();
      console.log(
        "✅ [saveChecklistToDatabase] Dados recebidos da API:",
        savedRecord
      );

      // Salvar ID do registro no localStorage para referência
      if (savedRecord.id) {
        localStorage.setItem("basell_current_checklist_id", savedRecord.id);
        console.log(
          "✅ [saveChecklistToDatabase] ID salvo no localStorage:",
          savedRecord.id
        );
      }

      console.log(
        "✅ [saveChecklistToDatabase] Checklist salvo com sucesso via API:",
        savedRecord
      );
      return savedRecord;
    } catch (fetchError) {
      console.error(
        "❌ [saveChecklistToDatabase] Erro na requisição fetch:",
        fetchError
      );
      throw fetchError;
    }
  } catch (error) {
    console.error(
      "❌ [saveChecklistToDatabase] Erro geral ao salvar checklist via API:",
      error
    );
    console.error("❌ [saveChecklistToDatabase] Stack trace:", error.stack);
    throw error;
  }
}

// Função auxiliar para mapear status do frontend para enum do banco
function mapStatusToEnum(status) {
  switch (status) {
    case "ok":
      return "Conforme";
    case "not_ok":
      return "Não conforme";
    case "na":
      return "Não aplicável";
    default:
      return "Conforme"; // Valor padrão
  }
}

console.log("✅ Sistema BASELL - Redirecionamento carregado com sucesso!");
