/**
 * Sistema de Checklist Digital - Funções Principais
 * Gerencia a tabela de registros na página principal
 */

// Configuração da API
const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Busca todos os checklists da API
 * @returns {Promise<Array>} Lista de checklists
 */
async function fetchChecklists() {
  try {
    const response = await fetch(`${API_BASE_URL}/checklist`);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      throw new Error(result.message || 'Erro ao buscar dados');
    }
  } catch (error) {
    console.error('Erro ao buscar checklists:', error);
    throw error;
  }
}

/**
 * Formata a data para exibição
 * @param {string} dateString - Data em formato ISO
 * @returns {string} Data formatada
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    return 'Data inválida';
  }
}

/**
 * Determina o status do checklist baseado nos dados
 * @param {Object} checklist - Dados do checklist
 * @returns {Object} Status com classe CSS e texto
 */
function getChecklistStatus(checklist) {
  if (checklist.status === 'finalizado') {
    return {
      text: 'Concluído',
      class: 'bg-green-100 text-green-800'
    };
  } else if (checklist.status === 'terminou') {
    return {
      text: 'Aguardando Finalização',
      class: 'bg-blue-100 text-blue-800'
    };
  } else {
    return {
      text: 'Pendente',
      class: 'bg-yellow-100 text-yellow-800'
    };
  }
}

/**
 * Deleta um checklist
 * @param {number} checklistId - ID do checklist
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function deleteChecklist(checklistId) {
  try {
    const response = await fetch(`${API_BASE_URL}/checklist/${checklistId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Erro ao deletar checklist:', error);
    throw error;
  }
}

/**
 * Gera o HTML para uma linha da tabela
 * @param {Object} checklist - Dados do checklist
 * @returns {string} HTML da linha
 */
function generateTableRow(checklist) {
  const status = getChecklistStatus(checklist);
  const formattedDate = formatDate(checklist.dataInspecao || checklist.createdAt);
  
  return `
    <tr class="hover:bg-gray-50 transition-colors" data-checklist-id="${checklist.id}">
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ${checklist.nomeMotorista || 'N/A'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
        ${checklist.placaVeiculo || 'N/A'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${formattedDate}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.class}">
          ${status.text}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div class="flex space-x-2">
          <button
            class="text-blue-600 hover:text-blue-800 transition-colors"
            title="Ver mais"
            onclick="viewChecklist(${checklist.id})"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </button>
          <button
            class="text-red-600 hover:text-red-800 transition-colors"
            title="Deletar"
            onclick="confirmDeleteChecklist(${checklist.id})"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
          <button
            class="text-green-600 hover:text-green-800 transition-colors"
            title="Download"
            onclick="downloadBasellPdf('checklist-${checklist.id}', event)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Atualiza a tabela com dados da API
 */
async function updateTable() {
  const tableBody = document.querySelector('#basell-table-body');
  const loadingMessage = document.querySelector('#loading-message');
  const errorMessage = document.querySelector('#error-message');
  
  if (!tableBody) {
    console.error('Elemento da tabela não encontrado');
    return;
  }
  
  try {
    // Mostrar loading
    if (loadingMessage) loadingMessage.style.display = 'block';
    if (errorMessage) errorMessage.style.display = 'none';
    
    // Buscar dados
    const checklists = await fetchChecklists();
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    if (checklists.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-8 text-center text-gray-500">
            <div class="flex flex-col items-center">
              <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p class="text-lg font-medium">Nenhum checklist encontrado</p>
              <p class="text-sm">Comece criando seu primeiro checklist</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      // Adicionar linhas da tabela
      checklists.forEach(checklist => {
        tableBody.innerHTML += generateTableRow(checklist);
      });
    }
    
    // Esconder loading
    if (loadingMessage) loadingMessage.style.display = 'none';
    
  } catch (error) {
    console.error('Erro ao atualizar tabela:', error);
    
    // Mostrar erro
    if (loadingMessage) loadingMessage.style.display = 'none';
    if (errorMessage) {
      errorMessage.style.display = 'block';
      errorMessage.textContent = `Erro ao carregar dados: ${error.message}`;
    }
    
    // Mostrar mensagem de erro na tabela
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-8 text-center text-red-500">
          <div class="flex flex-col items-center">
            <svg class="w-12 h-12 text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-lg font-medium">Erro ao carregar dados</p>
            <p class="text-sm">${error.message}</p>
            <button onclick="updateTable()" class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
              Tentar novamente
            </button>
          </div>
        </td>
      </tr>
    `;
  }
}

/**
 * Visualiza detalhes de um checklist
 * @param {number} checklistId - ID do checklist
 */
function viewChecklist(checklistId) {
  // Por enquanto, redireciona para a página do checklist
  window.location.href = `basell/basell.html?id=${checklistId}`;
}

/**
 * Confirma e deleta um checklist
 * @param {number} checklistId - ID do checklist
 */
async function confirmDeleteChecklist(checklistId) {
  if (confirm('Tem certeza que deseja deletar este checklist? Esta ação não pode ser desfeita.')) {
    try {
      const success = await deleteChecklist(checklistId);
      
      if (success) {
        alert('Checklist deletado com sucesso!');
        await updateTable(); // Recarregar tabela
      } else {
        alert('Erro ao deletar checklist.');
      }
    } catch (error) {
      alert(`Erro ao deletar checklist: ${error.message}`);
    }
  }
}

/**
 * Inicializa a página
 */
function initializePage() {
  console.log('Inicializando Sistema de Checklist Digital...');
  
  // Carregar dados da tabela
  updateTable();
  
  // Configurar atualização automática a cada 30 segundos
  setInterval(updateTable, 30000);
  
  console.log('Sistema inicializado com sucesso!');
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', initializePage);

// Exportar funções para uso global
window.updateTable = updateTable;
window.viewChecklist = viewChecklist;
window.confirmDeleteChecklist = confirmDeleteChecklist;