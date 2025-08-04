// Sistema BASELL - Checklist Digital
// Funcionalidades de validação e controle do formulário

// Variáveis globais
let currentStep = 1;
let checklistData = {
  nomeMotorista: "",
  placaVeiculo: "",
  dataExecucao: "",
  items: {},
};

// Inicialização quando a página carrega
document.addEventListener("DOMContentLoaded", function () {
  initializeForm();
  setupValidation();
  setupItemButtons();
  setupNextStepButton();
  setCurrentDate();
});

// Configurar data atual automaticamente
function setCurrentDate() {
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

  document.getElementById("dataExecucao").value = dateString;
  checklistData.dataExecucao = dateString;
}

// Configurar validação dos campos de input
function setupValidation() {
  const nomeMotoristaInput = document.getElementById("nomeMotorista");
  const placaVeiculoInput = document.getElementById("placaVeiculo");
  const salvarBtn = document.getElementById("salvarInfoInicial");

  // Adicionar event listeners para validação em tempo real
  nomeMotoristaInput.addEventListener("input", validateInputs);
  nomeMotoristaInput.addEventListener("blur", validateInputs);

  placaVeiculoInput.addEventListener("input", function () {
    // Formatar placa automaticamente
    formatPlaca(this);
    validateInputs();
  });
  placaVeiculoInput.addEventListener("blur", validateInputs);

  // Event listener para o botão salvar
  salvarBtn.addEventListener("click", salvarInformacoesIniciais);
}

// Configurar botões dos itens 1-9
function setupItemButtons() {
  // Selecionar todos os botões de status dos itens 1-9
  const statusButtons = document.querySelectorAll(".status-btn");

  statusButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const itemNumber = this.getAttribute("data-item");
      const status = this.getAttribute("data-status");

      // Verificar se é um item de 1 a 9
      if (itemNumber >= 1 && itemNumber <= 9) {
        handleItemSelection(itemNumber, status, this);
      }
    });
  });
}

// Configurar botão da próxima etapa
function setupNextStepButton() {
  // Criar botão da próxima etapa se não existir
  let nextStepBtn = document.getElementById("nextStepBtn");
  if (!nextStepBtn) {
    nextStepBtn = createNextStepButton();
  }

  // Adicionar event listener
  nextStepBtn.addEventListener("click", showConfirmationModal);
}

// Criar botão da próxima etapa
function createNextStepButton() {
  // Encontrar a div existente que contém o botão "Etapa Anterior"
  const section1 = document.getElementById("section1");
  const existingButtonContainer = section1.querySelector(
    ".flex.justify-between.items-center"
  );

  if (existingButtonContainer) {
    // Usar a div existente
    const nextStepBtn = document.createElement("button");
    nextStepBtn.id = "nextStepBtn";
    nextStepBtn.type = "button";
    nextStepBtn.disabled = true;

    // Usar as mesmas classes do botão "Etapa Anterior" para manter consistência
    nextStepBtn.className =
      "px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed";

    nextStepBtn.innerHTML = `
      <span>Próxima Etapa</span>
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        ></path>
      </svg>
    `;

    // Adicionar o botão à div existente
    existingButtonContainer.appendChild(nextStepBtn);

    return nextStepBtn;
  } else {
    // Fallback: criar nova div se não encontrar a existente
    const buttonContainer = document.createElement("div");
    buttonContainer.className =
      "flex justify-between items-center mt-8 pt-6 border-t border-gray-200";

    const nextStepBtn = document.createElement("button");
    nextStepBtn.id = "nextStepBtn";
    nextStepBtn.type = "button";
    nextStepBtn.disabled = true;
    nextStepBtn.className =
      "px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed";

    nextStepBtn.innerHTML = `
      <span>Próxima Etapa</span>
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        ></path>
      </svg>
    `;

    buttonContainer.appendChild(nextStepBtn);
    section1.appendChild(buttonContainer);

    return nextStepBtn;
  }
}

// Gerenciar seleção de itens
function handleItemSelection(itemNumber, status, clickedButton) {
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

  // Feedback visual adicional com animação
  clickedButton.style.transform = "scale(0.95)";
  setTimeout(() => {
    clickedButton.style.transform = "scale(1)";
  }, 150);

  // Log para debug
  console.log(`Item ${itemNumber} selecionado: ${status}`);
  console.log("Dados atuais:", checklistData);

  // Verificar se todos os itens foram preenchidos
  checkFormCompletion();
}

// Verificar se o formulário está completo
function checkFormCompletion() {
  const totalItems = 9; // Itens 1 a 9
  const completedItems = Object.keys(checklistData.items).length;

  if (completedItems === totalItems) {
    console.log("Todos os itens da Etapa 1 foram preenchidos!");
    enableNextStepButton();
    showCompletionFeedback();
  } else {
    disableNextStepButton();
  }
}

// Habilitar botão da próxima etapa
function enableNextStepButton() {
  const nextStepBtn = document.getElementById("nextStepBtn");
  if (nextStepBtn) {
    nextStepBtn.disabled = false;
    nextStepBtn.classList.remove(
      "disabled:from-gray-400",
      "disabled:to-gray-500",
      "disabled:cursor-not-allowed",
      "disabled:transform-none",
      "disabled:hover:border-transparent"
    );
    nextStepBtn.classList.add(
      "hover:from-blue-600",
      "hover:to-blue-700",
      "hover:scale-105",
      "hover:border-blue-300"
    );

    // Adicionar animação de destaque
    nextStepBtn.style.animation = "pulse 2s infinite";
  }
}

// Desabilitar botão da próxima etapa
function disableNextStepButton() {
  const nextStepBtn = document.getElementById("nextStepBtn");
  if (nextStepBtn) {
    nextStepBtn.disabled = true;
    nextStepBtn.classList.add(
      "disabled:from-gray-400",
      "disabled:to-gray-500",
      "disabled:cursor-not-allowed",
      "disabled:transform-none",
      "disabled:hover:border-transparent"
    );
    nextStepBtn.classList.remove(
      "hover:from-blue-600",
      "hover:to-blue-700",
      "hover:scale-105",
      "hover:border-blue-300"
    );

    // Remover animação
    nextStepBtn.style.animation = "none";
  }
}

// Mostrar feedback de conclusão
function showCompletionFeedback() {
  // Criar notificação de sucesso
  const notification = document.createElement("div");
  notification.className =
    "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300";
  notification.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span class="font-semibold">Etapa 1 Concluída!</span>
        </div>
    `;

  document.body.appendChild(notification);

  // Animar entrada
  setTimeout(() => {
    notification.classList.remove("translate-x-full");
  }, 100);

  // Remover após 3 segundos
  setTimeout(() => {
    notification.classList.add("translate-x-full");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Mostrar modal de confirmação
function showConfirmationModal() {
  // Verificar se há observações vazias
  const observacoes = document.querySelectorAll('textarea[id*="observacao"]');
  let hasEmptyObservations = false;

  observacoes.forEach((textarea) => {
    if (textarea.value.trim() === "") {
      hasEmptyObservations = true;
    }
  });

  // Se não há observações vazias, avançar diretamente
  if (!hasEmptyObservations) {
    goToNextStep();
    return;
  }

  // Criar overlay do modal
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "confirmationModal";
  modalOverlay.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 opacity-0 transition-opacity duration-300";

  // Criar conteúdo do modal
  const modalContent = document.createElement("div");
  modalContent.className =
    "bg-white rounded-xl p-6 max-w-md mx-4 transform scale-95 transition-transform duration-300";

  modalContent.innerHTML = `
        <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Observações Pendentes</h3>
            <p class="text-gray-600 mb-6">Você possui uma ou mais observações vazias. Tem certeza que deseja continuar sem preenchê-las?</p>
            <div class="flex space-x-3 justify-center">
                <button id="cancelBtn" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors duration-200">
                    Cancelar
                </button>
                <button id="confirmBtn" class="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors duration-200">
                    Continuar Mesmo Assim
                </button>
            </div>
        </div>
    `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  // Animar entrada do modal
  setTimeout(() => {
    modalOverlay.classList.remove("opacity-0");
    modalContent.classList.remove("scale-95");
    modalContent.classList.add("scale-100");
  }, 10);

  // Event listeners dos botões
  document
    .getElementById("cancelBtn")
    .addEventListener("click", closeConfirmationModal);
  document.getElementById("confirmBtn").addEventListener("click", () => {
    closeConfirmationModal();
    goToNextStep();
  });

  // Fechar modal ao clicar no overlay
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeConfirmationModal();
    }
  });
}

// Fechar modal de confirmação
function closeConfirmationModal() {
  const modal = document.getElementById("confirmationModal");
  if (modal) {
    const modalContent = modal.querySelector("div");

    modal.classList.add("opacity-0");
    modalContent.classList.remove("scale-100");
    modalContent.classList.add("scale-95");

    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);

    document.removeEventListener("keydown", handleEscapeKey);
  }
}

// Lidar com tecla ESC
function handleEscapeKey(e) {
  if (e.key === "Escape") {
    closeConfirmationModal();
  }
}

// Avançar para próxima etapa
// Função goToNextStep removida - duplicada. A versão completa está na linha 1146

// Mostrar mensagem de sucesso
function showSuccessMessage(message) {
  const notification = document.createElement("div");
  notification.className =
    "fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300";
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
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Validar campos de input e habilitar/desabilitar botão
function validateInputs() {
  const nomeMotorista = document.getElementById("nomeMotorista").value.trim();
  const placaVeiculo = document.getElementById("placaVeiculo").value.trim();
  const salvarBtn = document.getElementById("salvarInfoInicial");
  const indicadorStatus = document.getElementById("indicadorStatus");
  const textoStatus = document.getElementById("textoStatus");

  // Validar nome do motorista
  const nomeValido = nomeMotorista.length >= 3;

  // Validar placa do veículo (formato ABC-1234 ou ABC1234)
  const placaRegex = /^[A-Z]{3}-?[0-9]{4}$/;
  const placaValida = placaRegex.test(placaVeiculo.toUpperCase());

  // Aplicar estilos visuais aos campos
  const nomeInput = document.getElementById("nomeMotorista");
  const placaInput = document.getElementById("placaVeiculo");

  // Validação visual do nome
  if (nomeMotorista.length > 0) {
    if (nomeValido) {
      nomeInput.classList.remove("campo-invalido");
      nomeInput.classList.add("campo-valido");
      document.getElementById("erroNomeMotorista").classList.add("hidden");
    } else {
      nomeInput.classList.remove("campo-valido");
      nomeInput.classList.add("campo-invalido");
      document.getElementById("erroNomeMotorista").classList.remove("hidden");
    }
  } else {
    nomeInput.classList.remove("campo-valido", "campo-invalido");
    document.getElementById("erroNomeMotorista").classList.add("hidden");
  }

  // Validação visual da placa
  if (placaVeiculo.length > 0) {
    if (placaValida) {
      placaInput.classList.remove("campo-invalido");
      placaInput.classList.add("campo-valido");
      document.getElementById("erroPlacaVeiculo").classList.add("hidden");
    } else {
      placaInput.classList.remove("campo-valido");
      placaInput.classList.add("campo-invalido");
      document.getElementById("erroPlacaVeiculo").classList.remove("hidden");
    }
  } else {
    placaInput.classList.remove("campo-valido", "campo-invalido");
    document.getElementById("erroPlacaVeiculo").classList.add("hidden");
  }

  // Habilitar/desabilitar botão e atualizar status
  if (nomeValido && placaValida) {
    salvarBtn.disabled = false;
    salvarBtn.classList.remove(
      "disabled:bg-gray-400",
      "disabled:cursor-not-allowed"
    );
    salvarBtn.classList.add("hover:bg-blue-700");

    indicadorStatus.classList.remove("bg-red-400");
    indicadorStatus.classList.add("bg-green-400");
    textoStatus.textContent = "Informações válidas - Pronto para salvar";
    textoStatus.classList.remove("text-gray-600");
    textoStatus.classList.add("text-green-600");
  } else {
    salvarBtn.disabled = true;
    salvarBtn.classList.add(
      "disabled:bg-gray-400",
      "disabled:cursor-not-allowed"
    );
    salvarBtn.classList.remove("hover:bg-blue-700");

    indicadorStatus.classList.remove("bg-green-400");
    indicadorStatus.classList.add("bg-red-400");
    textoStatus.textContent = "Preencha as informações obrigatórias";
    textoStatus.classList.remove("text-green-600");
    textoStatus.classList.add("text-gray-600");
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

// Salvar informações iniciais
function salvarInformacoesIniciais() {
  const nomeMotorista = document.getElementById("nomeMotorista").value.trim();
  const placaVeiculo = document.getElementById("placaVeiculo").value.trim();

  // Salvar dados no objeto global
  checklistData.nomeMotorista = nomeMotorista;
  checklistData.placaVeiculo = placaVeiculo.toUpperCase();

  // Feedback visual de sucesso
  const salvarBtn = document.getElementById("salvarInfoInicial");
  const originalText = salvarBtn.innerHTML;

  salvarBtn.innerHTML = '<span class="mr-1">✅</span>Informações Salvas!';
  salvarBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
  salvarBtn.classList.add("bg-green-600");

  // Ocultar seção de informações iniciais após 2 segundos
  setTimeout(() => {
    document.getElementById("infoInicialContainer").style.display = "none";

    // Mostrar primeira etapa
    document.getElementById("section1").style.display = "block";

    // Scroll suave para a primeira etapa
    document.getElementById("section1").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 2000);

  console.log("Informações iniciais salvas:", checklistData);
}

// Inicializar formulário
function initializeForm() {
  // Ocultar todas as seções exceto informações iniciais
  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => {
    section.style.display = "none";
  });

  // Mostrar apenas a seção de informações iniciais
  document.getElementById("infoInicialContainer").style.display = "block";
}

// Dados para segunda etapa
let step2Data = {
  items: {
    10: { media: [], observations: "" },
    11: { media: [], observations: "" },
    12: { media: [], observations: "" },
    13: { media: [], observations: "" },
    14: { media: [], observations: "" },
  },
};

// Função principal para selecionar mídia com getUserMedia
function selectMedia(itemNumber, mediaType) {
  currentMediaItem = itemNumber;
  currentMediaType = mediaType;

  if (mediaType === "photo") {
    capturePhoto(itemNumber);
  } else if (mediaType === "video") {
    captureVideo(itemNumber);
  }
}

// Função para gerenciar upload de mídia
function handleMediaUpload(itemNumber, files) {
  const mediaPreview = document.getElementById(`mediaPreview${itemNumber}`);
  const mediaUpload = document.getElementById(`mediaUpload${itemNumber}`);

  if (files.length > 0) {
    // Adicionar arquivos aos dados
    step2Data.items[itemNumber].media = Array.from(files);

    // Limpar preview anterior
    mediaPreview.innerHTML = "";

    // Criar preview para cada arquivo
    Array.from(files).forEach((file, index) => {
      const previewItem = document.createElement("div");
      previewItem.className =
        "flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 mb-2";

      const fileInfo = document.createElement("div");
      fileInfo.className = "flex items-center space-x-3";

      const fileIcon = document.createElement("div");
      fileIcon.className =
        "flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer hover:scale-105 transition-transform";

      if (file.type.startsWith("image/")) {
        fileIcon.className += " bg-green-100 text-green-600";
        fileIcon.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        `;
      } else if (file.type.startsWith("video/")) {
        fileIcon.className += " bg-purple-100 text-purple-600";
        fileIcon.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
        `;
      }

      // Adicionar evento de clique para abrir preview
      fileIcon.onclick = () =>
        openPreviewModal(step2Data.items[itemNumber].media, index);

      const fileName = document.createElement("span");
      fileName.className =
        "text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600";
      fileName.textContent = file.name;
      fileName.onclick = () =>
        openPreviewModal(step2Data.items[itemNumber].media, index);

      const fileSize = document.createElement("span");
      fileSize.className = "text-xs text-gray-500";
      fileSize.textContent = `(${(file.size / 1024 / 1024).toFixed(2)} MB)`;

      fileInfo.appendChild(fileIcon);
      fileInfo.appendChild(fileName);
      fileInfo.appendChild(fileSize);

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "flex items-center space-x-2";

      // Botão de visualizar
      const viewBtn = document.createElement("button");
      viewBtn.className =
        "text-blue-500 hover:text-blue-700 p-1 rounded transition-colors";
      viewBtn.title = "Visualizar em tela grande";
      viewBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
      `;
      viewBtn.onclick = () =>
        openPreviewModal(step2Data.items[itemNumber].media, index);

      // Botão de remover
      const removeBtn = document.createElement("button");
      removeBtn.className =
        "text-red-500 hover:text-red-700 p-1 rounded transition-colors";
      removeBtn.title = "Remover arquivo";
      removeBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `;
      removeBtn.onclick = () => removeMediaFile(itemNumber, index);

      actionsDiv.appendChild(viewBtn);
      actionsDiv.appendChild(removeBtn);

      previewItem.appendChild(fileInfo);
      previewItem.appendChild(actionsDiv);
      mediaPreview.appendChild(previewItem);
    });

    // Atualizar visual do upload
    mediaUpload.classList.remove("border-blue-200", "bg-blue-50");
    mediaUpload.classList.add("border-green-200", "bg-green-50");

    // Verificar se a etapa 2 está completa
    checkStep2Completion();

    // Se estamos na etapa 2, verificar conclusão da etapa 2
      if (currentStep === 2) {
        checkStep2MediaCompletion();
      }
  }
}

// Função para remover arquivo de mídia
function removeMediaFile(itemNumber, fileIndex) {
  step2Data.items[itemNumber].media.splice(fileIndex, 1);

  // Recriar preview
  const mediaPreview = document.getElementById(`mediaPreview${itemNumber}`);
  mediaPreview.innerHTML = "";

  if (step2Data.items[itemNumber].media.length > 0) {
    handleMediaUpload(itemNumber, step2Data.items[itemNumber].media);
  } else {
    // Resetar visual do upload
    const mediaUpload = document.getElementById(`mediaUpload${itemNumber}`);
    mediaUpload.classList.remove("border-green-200", "bg-green-50");
    mediaUpload.classList.add("border-blue-200", "bg-blue-50");
  }

  checkStep2Completion();
  
  // Se estamos na etapa 2, verificar conclusão da etapa 2
  if (currentStep === 2) {
    checkStep2MediaCompletion();
  }
}

// Variáveis globais para mídia
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let currentMediaItem = null;
let currentMediaType = null;

// Verificar se a etapa 2 está completa
function checkStep2Completion() {
  const totalItems = 5; // Itens 10-14
  let completedItems = 0;

  // Verificar se cada item tem pelo menos uma mídia
  for (let i = 10; i <= 14; i++) {
    if (step2Data.items[i].media.length > 0) {
      completedItems++;
    }
  }

  if (completedItems === totalItems) {
    console.log("Todos os itens da Etapa 2 foram preenchidos!");
    enableStep2NextButton();
    showStep2CompletionFeedback();
  } else {
    disableStep2NextButton();
  }
}

// Habilitar botão da próxima etapa (Etapa 2)
function enableStep2NextButton() {
  let nextStepBtn = document.getElementById("nextToStep3");
  if (!nextStepBtn) {
    nextStepBtn = createStep2NextButton();
  }

  nextStepBtn.disabled = false;
  nextStepBtn.classList.remove("bg-gray-300", "cursor-not-allowed");
  nextStepBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
}

// Desabilitar botão da próxima etapa (Etapa 2)
function disableStep2NextButton() {
  const nextStepBtn = document.getElementById("nextToStep3");
  if (nextStepBtn) {
    nextStepBtn.disabled = true;
    nextStepBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
    nextStepBtn.classList.add("bg-gray-300", "cursor-not-allowed");
  }
}

// Criar botão da próxima etapa para Etapa 2
function createStep2NextButton() {
  // Procurar pela div existente que contém o botão "Etapa Anterior"
  const existingContainer = document.querySelector(
    "#section2 .flex.justify-between.items-center"
  );

  if (existingContainer) {
    // Se a div já existe, apenas adicionar o botão de próxima etapa
    const nextBtn = document.createElement("button");
    nextBtn.id = "nextToStep3";
    nextBtn.type = "button";
    nextBtn.disabled = true;
    nextBtn.className =
      "px-6 py-3 bg-gray-300 text-white rounded-lg font-medium cursor-not-allowed transition-all duration-200 flex items-center space-x-2";
    nextBtn.innerHTML = `
      <span>Próxima Etapa</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    `;
    nextBtn.onclick = () => goToStep3();

    existingContainer.appendChild(nextBtn);
    return nextBtn;
  } else {
    // Fallback: criar a div completa se não existir
    const section2 = document.getElementById("section2");
    const buttonContainer = document.createElement("div");
    buttonContainer.className =
      "flex justify-between items-center mt-8 pt-6 border-t border-gray-200";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className =
      "px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-200 flex items-center space-x-2";
    prevBtn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
      <span>Etapa Anterior</span>
    `;
    prevBtn.onclick = () => goToPreviousStep(1);

    const nextBtn = document.createElement("button");
    nextBtn.id = "nextToStep3";
    nextBtn.type = "button";
    nextBtn.disabled = true;
    nextBtn.className =
      "px-6 py-3 bg-gray-300 text-white rounded-lg font-medium cursor-not-allowed transition-all duration-200 flex items-center space-x-2";
    nextBtn.innerHTML = `
      <span>Próxima Etapa</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    `;
    nextBtn.onclick = () => goToStep3();

    buttonContainer.appendChild(prevBtn);
    buttonContainer.appendChild(nextBtn);
    section2.appendChild(buttonContainer);

    return nextBtn;
  }
}

// Feedback de conclusão da Etapa 2
function showStep2CompletionFeedback() {
  showSuccessMessage(
    "✅ Etapa 2 concluída! Todas as mídias foram adicionadas."
  );
}

// Navegar para etapa anterior
function goToPreviousStep(targetStep) {
  if (targetStep === 1) {
    document.getElementById("section2").style.display = "none";
    document.getElementById("section1").style.display = "block";
    currentStep = 1;
  } else if (targetStep === 2) {
    document.getElementById("section4").style.display = "none";
    document.getElementById("section2").style.display = "block";
    currentStep = 2;
  }

  // Scroll para a seção
  document.getElementById(`section${targetStep}`).scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Função para ir para a etapa final (Resumo)
function goToStep3() {
  // Ocultar etapa 2 (mídias)
  document.getElementById("section2").style.display = "none";

  // Mostrar etapa 3 (revisão e finalização)
  document.getElementById("section4").style.display = "block";

  // Atualizar step atual
  currentStep = 3;

  // Popular o resumo do checklist
  populateChecklistSummary();

  // Scroll para o topo
  document.getElementById("section4").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Configurar botão da etapa 2 para ir para etapa 3
function setupStep2NextButton() {
  const nextBtn = document.getElementById("nextToStep3");
  if (nextBtn && !nextBtn.onclick) {
    nextBtn.onclick = () => goToStep3();
  }
  // Verificar estado inicial
  checkStep2MediaCompletion();
}

// Verificar conclusão da Etapa 2 (Mídias)
function checkStep2MediaCompletion() {
  // Verificar se todas as mídias obrigatórias foram adicionadas
  let allMediaAdded = true;
  for (let i = 10; i <= 14; i++) {
    const mediaCount = step2Data.items[i]?.media?.length || 0;
    if (mediaCount === 0) {
      allMediaAdded = false;
      break;
    }
  }

  if (allMediaAdded) {
    enableStep2NextButton();
  } else {
    disableStep2NextButton();
  }
}

// Habilitar botão da próxima etapa (Etapa 2)


// Configurar botão da etapa 2 para ir para etapa 3


// Função para ir para a etapa 3 (Conclusão)
function goToStep3Final() {
  // Ocultar etapa 2 (mídias)
  document.getElementById("section2").style.display = "none";

  // Mostrar etapa 3 (conclusão)
  document.getElementById("section4").style.display = "block";

  // Atualizar step atual
  currentStep = 3;

  // Preencher resumo dos dados
  populateChecklistSummary();

  // Scroll para o topo
  document.getElementById("section4").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Função para popular o resumo do checklist
// Função para popular dados de teste
function populateTestData() {
  checklistData.nomeMotorista = "João Silva";
  checklistData.placaVeiculo = "ABC-1234";
  checklistData.dataExecucao = "15/01/2025 às 14:30";
  
  // Popular itens do checklist
  for (let i = 1; i <= 9; i++) {
    checklistData.items[`item${i}`] = i % 3 === 0 ? "ok" : i % 3 === 1 ? "not_ok" : "na";
  }
  
  // Popular dados de mídia
  for (let i = 10; i <= 14; i++) {
    step2Data.items[i].media = ["foto_exemplo.jpg", "video_exemplo.mp4"];
    step2Data.items[i].observations = `Observação do item ${i}`;
  }
  
  console.log("Dados de teste populados:", checklistData, step2Data);
}

// Função para testar a etapa 3 diretamente
function testarEtapa3() {
  // Popular dados de teste
  populateTestData();
  
  // Ocultar todas as seções
  document.getElementById("infoInicialContainer").style.display = "none";
  document.getElementById("section1").style.display = "none";
  document.getElementById("section2").style.display = "none";
  
  // Mostrar etapa 3
  document.getElementById("section4").style.display = "block";
  
  // Atualizar step atual
  currentStep = 3;
  
  // Popular o resumo
  populateChecklistSummary();
  
  // Scroll para a etapa 3
  document.getElementById("section4").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
  
  console.log("Teste da Etapa 3 iniciado!");
}

function populateChecklistSummary() {
  // Debug: Verificar dados antes de popular o resumo
  console.log("=== DEBUG: populateChecklistSummary ===");
  console.log("checklistData:", checklistData);
  console.log("step2Data:", step2Data);
  
  // Verificar se os elementos existem
  const basicInfoSummary = document.getElementById("basicInfoSummary");
  const questionsSummary = document.getElementById("questionsSummary");
  const mediaSummary = document.getElementById("mediaSummary");
  
  if (!basicInfoSummary || !questionsSummary || !mediaSummary) {
    console.error("Elementos da etapa 3 não encontrados!");
    return;
  }
  
  // Resumo das informações básicas
  basicInfoSummary.innerHTML = `
    <div class="bg-white rounded-lg p-4 border border-blue-200">
      <h4 class="font-semibold text-blue-800 mb-2">Motorista</h4>
      <p class="text-gray-700">${
        checklistData.nomeMotorista || "Não informado"
      }</p>
    </div>
    <div class="bg-white rounded-lg p-4 border border-blue-200">
      <h4 class="font-semibold text-blue-800 mb-2">Placa do Veículo</h4>
      <p class="text-gray-700">${
        checklistData.placaVeiculo || "Não informado"
      }</p>
    </div>
    <div class="bg-white rounded-lg p-4 border border-blue-200">
      <h4 class="font-semibold text-blue-800 mb-2">Data de Execução</h4>
      <p class="text-gray-700">${
        checklistData.dataExecucao || "Não informado"
      }</p>
    </div>
  `;

  // Resumo das perguntas (itens 1-9)
  let questionsHtml = "";

  const itemNames = {
    1: "Pneus",
    2: "Freios",
    3: "Direção",
    4: "Suspensão",
    5: "Iluminação",
    6: "Sinalização",
    7: "Documentação",
    8: "Equipamentos",
    9: "Limpeza",
  };

  for (let i = 1; i <= 9; i++) {
    const status = checklistData.items[`item${i}`] || "Não verificado";
    let statusText = "Não verificado";
    let statusColor = "gray";

    if (status === "ok") {
      statusText = "Conforme";
      statusColor = "green";
    } else if (status === "not_ok") {
      statusText = "Não conforme";
      statusColor = "red";
    } else if (status === "na") {
      statusText = "Não se aplica";
      statusColor = "yellow";
    }

    questionsHtml += `
      <div class="bg-white rounded-lg p-4 border border-yellow-200">
        <h4 class="font-semibold text-yellow-800 mb-2">Item ${i} - ${itemNames[i]}</h4>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800">
          ${statusText}
        </span>
      </div>
    `;
  }

  questionsSummary.innerHTML = questionsHtml;

  // Resumo das mídias (itens 10-14)
  let mediaHtml = "";

  const mediaItemNames = {
    10: "Inspeção dos Pneus",
    11: "Inspeção do Assoalho",
    12: "Proteções de Borracha",
    13: "Inspeção das Lonas",
    14: "Inspeção do Teto",
  };

  for (let i = 10; i <= 14; i++) {
    const mediaCount = step2Data.items[i]?.media?.length || 0;
    const hasObservations = step2Data.items[i]?.observations?.trim() || "";

    mediaHtml += `
      <div class="bg-white rounded-lg p-4 border border-purple-200">
        <h4 class="font-semibold text-purple-800 mb-2">${mediaItemNames[i]}</h4>
        <div class="flex items-center space-x-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            mediaCount > 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }">
            ${mediaCount} mídia(s)
          </span>
          ${
            hasObservations
              ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Com observações</span>'
              : ""
          }
        </div>
      </div>
    `;
  }

  mediaSummary.innerHTML = mediaHtml;
  
  // Configurar checkbox de confirmação final
  const finalConfirmation = document.getElementById("finalConfirmation");
  const finalizeBtn = document.getElementById("finalizeBtn");
  
  if (finalConfirmation && finalizeBtn) {
    finalConfirmation.addEventListener("change", function() {
      if (this.checked) {
        finalizeBtn.disabled = false;
        finalizeBtn.classList.remove("disabled:from-gray-400", "disabled:to-gray-500", "disabled:cursor-not-allowed");
      } else {
        finalizeBtn.disabled = true;
        finalizeBtn.classList.add("disabled:from-gray-400", "disabled:to-gray-500", "disabled:cursor-not-allowed");
      }
    });
    
    finalizeBtn.addEventListener("click", function() {
      if (!finalizeBtn.disabled) {
        alert("Checklist finalizado com sucesso!");
        console.log("Checklist finalizado:", { checklistData, step2Data });
      }
    });
  }
}

// Atualizar função goToNextStep existente
function goToNextStep() {
  console.log("Avançando para Etapa 2...");

  // Ocultar etapa atual
  document.getElementById("section1").style.display = "none";

  // Mostrar etapa 2
  document.getElementById("section2").style.display = "block";

  // Atualizar step atual
  currentStep = 2;

  // Criar botão da próxima etapa se não existir
  if (!document.getElementById("nextToStep3")) {
    createStep2NextButton();
  }

  // Configurar botão da etapa 2
  setupStep2NextButton();

  // Configurar listeners para observações da etapa 2
  setupStep2Observations();

  // Verificar se já há itens preenchidos
  checkStep2Completion();

  // Mostrar mensagem de sucesso
  showSuccessMessage(
    "📋 Etapa 2 iniciada! Adicione mídias para as inspeções visuais."
  );
}

// Configurar observações da Etapa 2
function setupStep2Observations() {
  for (let i = 10; i <= 14; i++) {
    const textarea = document.querySelector(`textarea[data-obs="${i}"]`);
    if (textarea) {
      textarea.addEventListener("input", function () {
        step2Data.items[i].observations = this.value;
      });
    }
  }
}

// Função principal para selecionar mídia com getUserMedia
function selectMedia(itemNumber, mediaType) {
  currentMediaItem = itemNumber;
  currentMediaType = mediaType;

  if (mediaType === "photo") {
    capturePhoto(itemNumber);
  } else if (mediaType === "video") {
    captureVideo(itemNumber);
  }
}

// Capturar foto usando getUserMedia
async function capturePhoto(itemNumber) {
  try {
    // Solicitar acesso à câmera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: "environment", // Câmera traseira por padrão
      },
    });

    // Criar modal para captura
    createCameraModal(itemNumber, "photo", stream);
  } catch (error) {
    console.error("Erro ao acessar câmera:", error);
    handleCameraError(error);
  }
}

// Capturar vídeo usando getUserMedia
async function captureVideo(itemNumber) {
  try {
    // Solicitar acesso à câmera e microfone
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: "environment",
      },
      audio: true,
    });

    // Criar modal para captura
    createCameraModal(itemNumber, "video", stream);
  } catch (error) {
    console.error("Erro ao acessar câmera/microfone:", error);
    handleCameraError(error);
  }
}

// Criar modal da câmera
function createCameraModal(itemNumber, mediaType, stream) {
  // Criar overlay do modal
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "cameraModal";
  modalOverlay.className =
    "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50";

  // Criar conteúdo do modal
  const modalContent = document.createElement("div");
  modalContent.className =
    "bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto";

  // Título do modal
  const title = document.createElement("h3");
  title.className = "text-lg font-semibold text-gray-900 mb-4";
  title.textContent = `${
    mediaType === "photo" ? "Capturar Foto" : "Gravar Vídeo"
  } - Item ${itemNumber}`;

  // Container do vídeo
  const videoContainer = document.createElement("div");
  videoContainer.className =
    "relative bg-black rounded-lg overflow-hidden mb-4";

  // Elemento de vídeo para preview
  const video = document.createElement("video");
  video.id = "cameraPreview";
  video.className = "w-full h-auto max-h-96";
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;

  // Canvas para captura de foto (oculto)
  const canvas = document.createElement("canvas");
  canvas.id = "photoCanvas";
  canvas.style.display = "none";

  // Container dos botões
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "flex justify-center space-x-4";

  // Botão de captura/gravação
  const captureBtn = document.createElement("button");
  captureBtn.className = `px-6 py-3 ${
    mediaType === "photo"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-red-600 hover:bg-red-700"
  } text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2`;
  captureBtn.innerHTML = `
    ${
      mediaType === "photo"
        ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg><span>Capturar Foto</span>'
        : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="10,8 16,12 10,16 10,8"></polygon></svg><span id="recordText">Iniciar Gravação</span>'
    }`;

  // Botão de trocar câmera
  const switchCameraBtn = document.createElement("button");
  switchCameraBtn.className =
    "px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2";
  switchCameraBtn.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
    </svg>
    <span>Trocar Câmera</span>
  `;

  // Botão de cancelar
  const cancelBtn = document.createElement("button");
  cancelBtn.className =
    "px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2";
  cancelBtn.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
    <span>Cancelar</span>
  `;

  // Event listeners
  if (mediaType === "photo") {
    captureBtn.onclick = () => takePhoto(itemNumber, video, canvas, stream);
  } else {
    captureBtn.onclick = () =>
      toggleVideoRecording(itemNumber, stream, captureBtn);
  }

  switchCameraBtn.onclick = () => switchCamera(itemNumber, mediaType);
  cancelBtn.onclick = () => closeCameraModal(stream);

  // Montar modal
  videoContainer.appendChild(video);
  videoContainer.appendChild(canvas);
  buttonContainer.appendChild(captureBtn);
  buttonContainer.appendChild(switchCameraBtn);
  buttonContainer.appendChild(cancelBtn);

  modalContent.appendChild(title);
  modalContent.appendChild(videoContainer);
  modalContent.appendChild(buttonContainer);
  modalOverlay.appendChild(modalContent);

  // Adicionar ao DOM
  document.body.appendChild(modalOverlay);

  // Armazenar stream global
  mediaStream = stream;

  // Fechar modal com ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeCameraModal(stream);
    }
  });
}

// Capturar foto
function takePhoto(itemNumber, video, canvas, stream) {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Desenhar frame atual do vídeo no canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Converter para blob
  canvas.toBlob(
    function (blob) {
      if (blob) {
        // Criar arquivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const file = new File(
          [blob],
          `item${itemNumber}_foto_${timestamp}.jpg`,
          {
            type: "image/jpeg",
            lastModified: Date.now(),
          }
        );

        // Adicionar à lista de mídias
        addMediaToItem(itemNumber, file);

        // Fechar modal
        closeCameraModal(stream);

        // Mostrar sucesso
        showSuccessMessage(`📷 Foto capturada para o Item ${itemNumber}!`);
      }
    },
    "image/jpeg",
    0.9
  );
}

// Alternar gravação de vídeo
function toggleVideoRecording(itemNumber, stream, button) {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    startVideoRecording(itemNumber, stream, button);
  } else {
    stopVideoRecording(itemNumber, button);
  }
}

// Iniciar gravação de vídeo
function startVideoRecording(itemNumber, stream, button) {
  recordedChunks = [];

  mediaRecorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp9",
  });

  mediaRecorder.ondataavailable = function (event) {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = function () {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const file = new File([blob], `item${itemNumber}_video_${timestamp}.webm`, {
      type: "video/webm",
      lastModified: Date.now(),
    });

    // Adicionar à lista de mídias
    addMediaToItem(itemNumber, file);

    // Fechar modal
    closeCameraModal(stream);

    // Mostrar sucesso
    showSuccessMessage(`🎥 Vídeo gravado para o Item ${itemNumber}!`);
  };

  mediaRecorder.start();

  // Atualizar botão
  button.className = button.className.replace(
    "bg-red-600 hover:bg-red-700",
    "bg-green-600 hover:bg-green-700"
  );
  button.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12"></rect>
    </svg>
    <span id="recordText">Parar Gravação</span>
  `;
}

// Parar gravação de vídeo
function stopVideoRecording(itemNumber, button) {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}

// Trocar câmera (frontal/traseira)
async function switchCamera(itemNumber, mediaType) {
  try {
    // Parar stream atual
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }

    // Determinar nova câmera
    const currentFacingMode = mediaStream
      .getVideoTracks()[0]
      .getSettings().facingMode;
    const newFacingMode =
      currentFacingMode === "environment" ? "user" : "environment";

    // Solicitar nova stream
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: newFacingMode,
      },
      audio: mediaType === "video",
    });

    // Atualizar vídeo
    const video = document.getElementById("cameraPreview");
    video.srcObject = newStream;
    mediaStream = newStream;
  } catch (error) {
    console.error("Erro ao trocar câmera:", error);
    showErrorMessage("Não foi possível trocar a câmera.");
  }
}

// Fechar modal da câmera
function closeCameraModal(stream) {
  // Parar todas as tracks
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  // Parar gravação se estiver ativa
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }

  // Remover modal
  const modal = document.getElementById("cameraModal");
  if (modal) {
    modal.remove();
  }

  // Limpar variáveis
  mediaStream = null;
  mediaRecorder = null;
  recordedChunks = [];
  currentMediaItem = null;
  currentMediaType = null;
}

// Adicionar mídia ao item
function addMediaToItem(itemNumber, file) {
  // Adicionar ao array de mídias
  step2Data.items[itemNumber].media.push(file);

  // Atualizar preview
  updateMediaPreview(itemNumber);

  // Verificar conclusão da etapa 2
  checkStep2Completion();

  // Se estamos na etapa 2, verificar conclusão da etapa 2
    if (currentStep === 2) {
      checkStep2MediaCompletion();
    }
}

// Função para criar modal de preview em tela grande
function createPreviewModal() {
  const modal = document.createElement("div");
  modal.id = "mediaPreviewModal";
  modal.className =
    "fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center hidden";
  modal.innerHTML = `
    <div class="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center p-4">
      <button 
        onclick="closePreviewModal()" 
        class="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      
      <div class="relative max-w-full max-h-full">
        <div id="previewContent" class="max-w-full max-h-full flex items-center justify-center"></div>
        
        <!-- Controles de navegação -->
        <button 
          id="prevMediaBtn" 
          onclick="navigateMedia(-1)" 
          class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-all"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <button 
          id="nextMediaBtn" 
          onclick="navigateMedia(1)" 
          class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-all"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        <!-- Indicador de posição -->
        <div id="mediaCounter" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Variáveis para controle do preview
let currentPreviewMedia = [];
let currentPreviewIndex = 0;

// Função para abrir preview em tela grande
function openPreviewModal(mediaArray, startIndex = 0) {
  if (!document.getElementById("mediaPreviewModal")) {
    createPreviewModal();
  }

  currentPreviewMedia = mediaArray;
  currentPreviewIndex = startIndex;

  const modal = document.getElementById("mediaPreviewModal");
  modal.classList.remove("hidden");

  displayCurrentMedia();
  updateNavigationButtons();

  // Fechar com ESC
  document.addEventListener("keydown", handlePreviewEscape);
}

// Função para fechar modal de preview
function closePreviewModal() {
  const modal = document.getElementById("mediaPreviewModal");
  modal.classList.add("hidden");

  // Limpar conteúdo
  const previewContent = document.getElementById("previewContent");
  previewContent.innerHTML = "";

  document.removeEventListener("keydown", handlePreviewEscape);
}

// Função para navegar entre mídias
function navigateMedia(direction) {
  currentPreviewIndex += direction;

  if (currentPreviewIndex < 0) {
    currentPreviewIndex = currentPreviewMedia.length - 1;
  } else if (currentPreviewIndex >= currentPreviewMedia.length) {
    currentPreviewIndex = 0;
  }

  displayCurrentMedia();
  updateNavigationButtons();
}

// Função para exibir mídia atual
function displayCurrentMedia() {
  const previewContent = document.getElementById("previewContent");
  const mediaCounter = document.getElementById("mediaCounter");
  const currentMedia = currentPreviewMedia[currentPreviewIndex];

  previewContent.innerHTML = "";

  if (currentMedia.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(currentMedia);
    img.className = "max-w-full max-h-full object-contain";
    img.style.maxHeight = "90vh";
    previewContent.appendChild(img);
  } else if (currentMedia.type.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(currentMedia);
    video.className = "max-w-full max-h-full object-contain";
    video.style.maxHeight = "90vh";
    video.controls = true;
    video.autoplay = false;
    previewContent.appendChild(video);
  }

  // Atualizar contador
  mediaCounter.textContent = `${currentPreviewIndex + 1} de ${
    currentPreviewMedia.length
  }`;
}

// Função para atualizar botões de navegação
function updateNavigationButtons() {
  const prevBtn = document.getElementById("prevMediaBtn");
  const nextBtn = document.getElementById("nextMediaBtn");

  if (currentPreviewMedia.length <= 1) {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
  } else {
    prevBtn.style.display = "block";
    nextBtn.style.display = "block";
  }
}

// Função para lidar com ESC no preview
function handlePreviewEscape(e) {
  if (e.key === "Escape") {
    closePreviewModal();
  }
}

// Atualizar preview de mídia
function updateMediaPreview(itemNumber) {
  const mediaPreview = document.getElementById(`mediaPreview${itemNumber}`);
  const mediaUpload = document.getElementById(`mediaUpload${itemNumber}`);

  if (!mediaPreview) return;

  // Limpar preview anterior
  mediaPreview.innerHTML = "";

  const mediaFiles = step2Data.items[itemNumber].media;

  if (mediaFiles.length > 0) {
    mediaFiles.forEach((file, index) => {
      const previewItem = document.createElement("div");
      previewItem.className =
        "flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 mb-2";

      const fileInfo = document.createElement("div");
      fileInfo.className = "flex items-center space-x-3";

      const fileIcon = document.createElement("div");
      fileIcon.className =
        "flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer hover:scale-105 transition-transform";

      if (file.type.startsWith("image/")) {
        fileIcon.className += " bg-green-100 text-green-600";
        fileIcon.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        `;
      } else if (file.type.startsWith("video/")) {
        fileIcon.className += " bg-purple-100 text-purple-600";
        fileIcon.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
        `;
      }

      // Adicionar evento de clique para abrir preview
      fileIcon.onclick = () =>
        openPreviewModal(step2Data.items[itemNumber].media, index);

      const fileName = document.createElement("span");
      fileName.className =
        "text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600";
      fileName.textContent = file.name;
      fileName.onclick = () =>
        openPreviewModal(step2Data.items[itemNumber].media, index);

      const fileSize = document.createElement("span");
      fileSize.className = "text-xs text-gray-500";
      fileSize.textContent = `(${(file.size / 1024 / 1024).toFixed(2)} MB)`;

      fileInfo.appendChild(fileIcon);
      fileInfo.appendChild(fileName);
      fileInfo.appendChild(fileSize);

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "flex items-center space-x-2";

      // Botão de visualizar
      const viewBtn = document.createElement("button");
      viewBtn.className =
        "text-blue-500 hover:text-blue-700 p-1 rounded transition-colors";
      viewBtn.title = "Visualizar em tela grande";
      viewBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
      `;
      viewBtn.onclick = () =>
        openPreviewModal(step2Data.items[itemNumber].media, index);

      // Botão de remover
      const removeBtn = document.createElement("button");
      removeBtn.className =
        "text-red-500 hover:text-red-700 p-1 rounded transition-colors";
      removeBtn.title = "Remover arquivo";
      removeBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `;
      removeBtn.onclick = () => removeMediaFile(itemNumber, index);

      actionsDiv.appendChild(viewBtn);
      actionsDiv.appendChild(removeBtn);

      previewItem.appendChild(fileInfo);
      previewItem.appendChild(actionsDiv);
      mediaPreview.appendChild(previewItem);
    });

    // Atualizar visual do upload
    if (mediaUpload) {
      mediaUpload.classList.remove("border-blue-200", "bg-blue-50");
      mediaUpload.classList.add("border-green-200", "bg-green-50");
    }
  } else {
    // Resetar visual do upload
    if (mediaUpload) {
      mediaUpload.classList.remove("border-green-200", "bg-green-50");
      mediaUpload.classList.add("border-blue-200", "bg-blue-50");
    }
  }
}

// Tratar erros da câmera
function handleCameraError(error) {
  let message = "Erro ao acessar a câmera.";

  if (error.name === "NotAllowedError") {
    message =
      "Acesso à câmera negado. Por favor, permita o acesso e tente novamente.";
  } else if (error.name === "NotFoundError") {
    message = "Câmera não encontrada. Verifique se há uma câmera conectada.";
  } else if (error.name === "NotSupportedError") {
    message = "Câmera não suportada pelo navegador.";
  } else if (error.name === "NotReadableError") {
    message = "Câmera está sendo usada por outro aplicativo.";
  }

  showErrorMessage(message);
}

// Mostrar mensagem de erro
function showErrorMessage(message) {
  const notification = document.createElement("div");
  notification.className =
    "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2";
  notification.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}
