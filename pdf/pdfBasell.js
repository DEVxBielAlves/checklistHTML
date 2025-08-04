/**
 * GERADOR DE PDF BASELL - Versão JavaScript Vanilla
 *
 * Este arquivo gera um PDF completo do checklist Basell com todas as funcionalidades:
 *
 * ESTRUTURA DO PDF:
 * 1. Cabeçalho com logo e título da MegaVale
 * 2. Informações do checklist (motorista, placa, data)
 * 3. Tabela com itens 1-9 de verificação
 * 4. Nova página com itens 10-14 (com vídeos)
 * 5. Para cada item com vídeo:
 *    - Título do item
 *    - Extração de 12 frames do vídeo em layout 4x3
 *    - Campo de observação com linhas para preenchimento
 * 6. Página de assinaturas (motorista e inspecionador)
 * 7. Rodapé (apenas na primeira página)
 *
 * FUNCIONALIDADES IMPLEMENTADAS:
 * - Extração de frames de vídeo usando HTML5 Canvas
 * - Layout em grade 4x3 para 12 imagens por item
 * - Placeholders quando vídeo não está disponível
 * - Limpeza de texto para compatibilidade com PDF
 * - Processamento de status de verificação
 * - Campos de observação formatados
 * - Página de assinaturas com campos predefinidos
 * - Processamento de mídia com priorização (fotos primeiro, depois vídeos)
 *
 * COMO USAR:
 * generateBasellPdf(checklistId);
 */

// Itens de verificação do checklist Basell
const verificationItems1 = [
  {
    id: 1,
    question: "Verificação dos pneus (calibragem, desgaste, objetos estranhos)",
  },
  {
    id: 2,
    question: "Verificação do sistema de freios (pastilhas, discos, fluido)",
  },
  {
    id: 3,
    question: "Verificação das luzes (faróis, lanternas, pisca-alerta)",
  },
  { id: 4, question: "Verificação dos espelhos retrovisores" },
  { id: 5, question: "Verificação do sistema de direção" },
  { id: 6, question: "Verificação do sistema de suspensão" },
  { id: 7, question: "Verificação dos cintos de segurança" },
  { id: 8, question: "Verificação do extintor de incêndio" },
  { id: 9, question: "Verificação da documentação do veículo" },
];

const verificationItems2 = [
  {
    id: 10,
    question: "Inspeção visual externa do veículo (carroceria, para-choques)",
  },
  { id: 11, question: "Verificação do motor (óleo, água, correias)" },
  { id: 12, question: "Verificação do sistema elétrico (bateria, alternador)" },
  { id: 13, question: "Verificação da carga e amarração" },
  { id: 14, question: "Verificação final e liberação do veículo" },
];

/**
 * Converte caracteres especiais para compatibilidade com PDF
 */
function limparTextoParaPdf(texto, maxLength) {
  if (!texto) return "";

  texto = String(texto);

  // Mapeamento de caracteres acentuados
  const mapaAcentos = {
    á: "a",
    à: "a",
    â: "a",
    ã: "a",
    ä: "a",
    é: "e",
    è: "e",
    ê: "e",
    ë: "e",
    í: "i",
    ì: "i",
    î: "i",
    ï: "i",
    ó: "o",
    ò: "o",
    ô: "o",
    õ: "o",
    ö: "o",
    ú: "u",
    ù: "u",
    û: "u",
    ü: "u",
    ç: "c",
    Á: "A",
    À: "A",
    Â: "A",
    Ã: "A",
    Ä: "A",
    É: "E",
    È: "E",
    Ê: "E",
    Ë: "E",
    Í: "I",
    Ì: "I",
    Î: "I",
    Ï: "I",
    Ó: "O",
    Ò: "O",
    Ô: "O",
    Õ: "O",
    Ö: "O",
    Ú: "U",
    Ù: "U",
    Û: "U",
    Ü: "U",
    Ç: "C",
  };

  // Substituir caracteres acentuados
  for (const [acento, semAcento] of Object.entries(mapaAcentos)) {
    texto = texto.replace(new RegExp(acento, "g"), semAcento);
  }

  // Remover caracteres Unicode não ASCII
  texto = texto.replace(/[^\x00-\x7F]/g, "");

  // Limpar espaços extras
  texto = texto.replace(/\s+/g, " ").trim();

  // Limitar comprimento se especificado
  if (maxLength && texto.length > maxLength) {
    texto = texto.substring(0, maxLength - 3) + "...";
  }

  return texto;
}

/**
 * Processa status para exibição no PDF
 */
function processarStatusParaPdf(status) {
  if (!status) {
    return "⏳ Pendente";
  }

  console.log("🔍 Processando status para PDF:", status);

  // Mapeamento completo e robusto para todos os casos de status
  const statusMapping = {
    // Status originais da interface Basell
    Conforme: "✅ Conforme",
    "Não Conforme": "❌ Não Conforme",
    "Não aplicável": "⚪ Não Aplicável",
    Pendente: "⏳ Pendente",

    // Status do sistema interno (ok, nok, na)
    ok: "✅ Conforme",
    nok: "❌ Não Conforme",
    na: "⚪ Não Aplicável",

    // Status do MaintenanceChecklist
    SIM: "✅ Conforme",
    NÃO: "❌ Não Conforme",
    "N/A": "⚪ Não Aplicável",
    Concluído: "✅ Conforme",

    // Status já formatados (caso venham do histórico)
    "✅ Conforme": "✅ Conforme",
    "Conforme ✅": "✅ Conforme",
    "❌ Não Conforme": "❌ Não Conforme",
    "Não Conforme ❌": "❌ Não Conforme",
    "⚪ Não se aplica": "⚪ Não Aplicável",
    "⚪ Não Aplicável": "⚪ Não Aplicável",
    "Não Aplicável": "⚪ Não Aplicável",
    "⏳ Pendente": "⏳ Pendente",

    // Variações alternativas e casos especiais
    Sim: "✅ Conforme",
    sim: "✅ Conforme",
    Não: "❌ Não Conforme",
    não: "❌ Não Conforme",
    NA: "⚪ Não Aplicável",
    OK: "✅ Conforme",
    aprovado: "✅ Conforme",
    reprovado: "❌ Não Conforme",
    falha: "❌ Não Conforme",

    // Casos especiais para garantir compatibilidade
    true: "✅ Conforme",
    false: "❌ Não Conforme",
    1: "✅ Conforme",
    0: "❌ Não Conforme",
  };

  const resultado = statusMapping[status] || "⏳ Pendente";
  console.log("✅ Status mapeado:", status, "->", resultado);
  return resultado;
}

/**
 * Cria um frame placeholder quando não é possível extrair do vídeo
 */
function criarFramePlaceholder() {
  const canvas = document.createElement("canvas");

  try {
    const width = 400;
    const height = 300;

    if (!isFinite(width) || !isFinite(height) || width <= 0 || height <= 0) {
      throw new Error("Dimensões inválidas para o canvas");
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Limpar canvas
      ctx.clearRect(0, 0, width, height);

      // Fundo cinza claro
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, width, height);

      // Borda
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      // Texto
      ctx.fillStyle = "#666666";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Desenhar texto com verificação de posição
      const centerX = width / 2;
      const centerY = height / 2;

      if (isFinite(centerX) && isFinite(centerY)) {
        ctx.fillText("IMAGEM DO VÍDEO", centerX, centerY - 15);
        ctx.fillText("NÃO DISPONÍVEL", centerX, centerY + 15);
      }
    }
  } catch (error) {
    console.error("Erro ao criar frame placeholder:", error);
    // Fallback: criar um canvas mínimo
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, 400, 300);
    }
  }

  return canvas;
}

/**
 * Cria um canvas a partir de uma imagem
 */
async function criarCanvasDeImagem(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Não foi possível obter contexto do canvas"));
        return;
      }

      // Definir tamanho do canvas
      canvas.width = 320;
      canvas.height = 240;

      // Calcular dimensões para manter proporção
      const aspectRatio = img.width / img.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (aspectRatio > canvas.width / canvas.height) {
        drawHeight = canvas.width / aspectRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * aspectRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      }

      // Preencher fundo preto
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Desenhar imagem centralizada
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      resolve(canvas);
    };

    img.onerror = () => {
      reject(new Error("Erro ao carregar imagem"));
    };

    img.src = imageUrl;
  });
}

/**
 * Extrai frames de um vídeo usando canvas
 */
async function extrairFramesVideo(videoUrl, numFrames = 12) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "metadata";

    const frames = [];

    // Timeout para evitar que a função trave
    const timeout = setTimeout(() => {
      console.warn("Timeout na extração de frames, usando placeholders");
      for (let i = 0; i < numFrames; i++) {
        frames.push(criarFramePlaceholder());
      }
      resolve(frames);
    }, 10000); // 10 segundos timeout

    video.addEventListener("loadedmetadata", () => {
      const duration = video.duration;

      // Validar duração
      if (!isFinite(duration) || duration <= 0 || isNaN(duration)) {
        console.warn("Duração do vídeo inválida:", duration);
        clearTimeout(timeout);
        for (let i = 0; i < numFrames; i++) {
          frames.push(criarFramePlaceholder());
        }
        resolve(frames);
        return;
      }

      // Validar dimensões do vídeo
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      if (
        !isFinite(videoWidth) ||
        !isFinite(videoHeight) ||
        videoWidth <= 0 ||
        videoHeight <= 0
      ) {
        console.warn("Dimensões do vídeo inválidas:", videoWidth, videoHeight);
        clearTimeout(timeout);
        for (let i = 0; i < numFrames; i++) {
          frames.push(criarFramePlaceholder());
        }
        resolve(frames);
        return;
      }

      const interval = duration / (numFrames + 1);
      let currentFrame = 0;

      const extractFrame = () => {
        if (currentFrame >= numFrames) {
          clearTimeout(timeout);
          resolve(frames);
          return;
        }

        const time = interval * (currentFrame + 1);

        // Validar tempo
        if (!isFinite(time) || time < 0 || time > duration) {
          console.warn("Tempo inválido para extração:", time);
          frames.push(criarFramePlaceholder());
          currentFrame++;
          extractFrame();
          return;
        }

        video.currentTime = time;

        const onSeeked = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = 400;
            canvas.height = 300;
            const ctx = canvas.getContext("2d");

            if (ctx) {
              // Verificar novamente as dimensões antes de desenhar
              const currentVideoWidth = video.videoWidth;
              const currentVideoHeight = video.videoHeight;

              if (
                isFinite(currentVideoWidth) &&
                isFinite(currentVideoHeight) &&
                currentVideoWidth > 0 &&
                currentVideoHeight > 0
              ) {
                // Limpar canvas antes de desenhar
                ctx.clearRect(0, 0, 400, 300);

                // Desenhar com validação
                ctx.drawImage(video, 0, 0, 400, 300);
              } else {
                console.warn(
                  "Dimensões do vídeo inválidas no momento da extração:",
                  currentVideoWidth,
                  currentVideoHeight
                );
                // Criar um frame placeholder manualmente
                ctx.fillStyle = "#f0f0f0";
                ctx.fillRect(0, 0, 400, 300);
                ctx.fillStyle = "#666666";
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.fillText("FRAME INVÁLIDO", 200, 150);
              }
            }

            frames.push(canvas);
          } catch (error) {
            console.error("Erro ao extrair frame:", error);
            frames.push(criarFramePlaceholder());
          }

          currentFrame++;

          video.removeEventListener("seeked", onSeeked);
          extractFrame();
        };

        video.addEventListener("seeked", onSeeked);
      };

      extractFrame();
    });

    video.addEventListener("error", (error) => {
      console.error("Erro no vídeo:", error);
      clearTimeout(timeout);
      // Criar placeholders em caso de erro
      for (let i = 0; i < numFrames; i++) {
        frames.push(criarFramePlaceholder());
      }
      resolve(frames);
    });

    try {
      video.src = videoUrl;
      video.load();
    } catch (error) {
      console.error("Erro ao carregar vídeo:", error);
      clearTimeout(timeout);
      for (let i = 0; i < numFrames; i++) {
        frames.push(criarFramePlaceholder());
      }
      resolve(frames);
    }
  });
}

/**
 * Adiciona cabeçalho ao PDF
 */
function addHeaderToPage(pdf) {
  // Título centralizado
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(29, 95, 181); // #1d5fb5

  const titulo = "Checklist de Carreta - MegaVale";
  const pageWidth = pdf.internal.pageSize.width;
  const textWidth = pdf.getTextWidth(titulo);
  const x = (pageWidth - textWidth) / 2;

  pdf.text(titulo, x, 20);

  // Linha decorativa
  pdf.setDrawColor(29, 95, 181);
  pdf.setLineWidth(0.5);
  pdf.line(15, 25, pageWidth - 15, 25);
}

/**
 * Adiciona rodapé ao PDF
 */
function addFooterToPage(pdf, pageNumber) {
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;

  // Verificar se é primeira página
  if (pageNumber === 1) {
    // Nome da empresa
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    const empresa = limparTextoParaPdf("MegaVale Transporte & Logística");
    pdf.text(empresa, pageWidth / 2, pageHeight - 25, { align: "center" });

    // Texto do relatório
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    const relatorio = limparTextoParaPdf(
      "Relatório gerado automaticamente pelo Sistema de Checklist MegaVale."
    );
    pdf.text(relatorio, pageWidth / 2, pageHeight - 20, { align: "center" });

    // Data
    const dataHora = new Date().toLocaleString("pt-BR");
    pdf.text(`Data: ${dataHora}`, pageWidth / 2, pageHeight - 15, {
      align: "center",
    });
  }

  // Numeração de páginas (em todas as páginas)
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Página ${pageNumber}`, pageWidth / 2, pageHeight - 5, {
    align: "center",
  });
}

/**
 * Adiciona layout de frames em grade 4x3 (12 imagens)
 */
function adicionarLayoutFramesSimple(pdf, frames, currentY) {
  const pageWidth = pdf.internal.pageSize.width;

  // Garantir que temos 12 frames
  while (frames.length < 12) {
    frames.push(criarFramePlaceholder());
  }

  // Limitar a 12 frames
  if (frames.length > 12) {
    frames.splice(12);
  }

  // Configurações do layout
  const margemEsquerda = 15;
  const larguraDisponivel = pageWidth - 30; // 15mm de cada lado
  const imgWidth = Math.min(45, (larguraDisponivel - 12) / 4); // 4 colunas
  const imgHeight = 35;
  const spacingX = (larguraDisponivel - imgWidth * 4) / 3;
  const spacingY = 6;

  let yPosition = currentY;

  // Layout 4x3 para 12 imagens
  for (let row = 0; row < 3; row++) {
    let currentX = margemEsquerda;

    for (let col = 0; col < 4; col++) {
      const frameIndex = row * 4 + col;

      if (frameIndex < frames.length) {
        const canvas = frames[frameIndex];
        const imgData = canvas.toDataURL("image/png");

        try {
          pdf.addImage(
            imgData,
            "PNG",
            currentX,
            yPosition,
            imgWidth,
            imgHeight
          );
        } catch (error) {
          console.error(`Erro ao adicionar imagem ${frameIndex}:`, error);
        }
      }

      currentX += imgWidth + spacingX;
    }

    yPosition += imgHeight + spacingY;
  }

  // Retornar nova posição Y
  return yPosition + 8;
}

/**
 * Adiciona campo de observação com texto
 */
function adicionarCampoObservacaoSimpleWithText(pdf, currentY, observacao) {
  const pageWidth = pdf.internal.pageSize.width;
  const larguraDisponivel = pageWidth - 30;
  const alturaObservacao = 40;

  // Título do campo
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("OBSERVAÇÕES:", 15, currentY);

  currentY += 8;

  // Caixa de observação
  pdf.setFillColor(250, 250, 250);
  pdf.rect(15, currentY, larguraDisponivel, alturaObservacao, "F");
  pdf.rect(15, currentY, larguraDisponivel, alturaObservacao, "S");

  // Texto da observação
  if (observacao && observacao.trim()) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);

    const observacaoLimpa = limparTextoParaPdf(observacao);
    const linhas = pdf.splitTextToSize(observacaoLimpa, larguraDisponivel - 6);

    let yTexto = currentY + 6;
    for (let i = 0; i < Math.min(linhas.length, 6); i++) {
      pdf.text(linhas[i], 18, yTexto);
      yTexto += 5;
    }
  }

  return currentY + alturaObservacao + 10;
}

/**
 * Adiciona página de assinaturas
 */
function adicionarPaginaAssinaturasSimple(pdf, nomeMotorista) {
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;

  // Título da página
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(29, 95, 181);
  pdf.text("ASSINATURAS E APROVAÇÕES", pageWidth / 2, 60, { align: "center" });

  let currentY = 80;

  // Campo do motorista
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("MOTORISTA:", 15, currentY);

  currentY += 10;
  pdf.setFont("helvetica", "normal");
  pdf.text(`Nome: ${limparTextoParaPdf(nomeMotorista)}`, 15, currentY);

  currentY += 20;
  pdf.line(15, currentY, pageWidth - 15, currentY);
  pdf.setFontSize(10);
  pdf.text("Assinatura do Motorista", pageWidth / 2, currentY + 8, {
    align: "center",
  });

  currentY += 30;
  pdf.line(15, currentY, pageWidth - 15, currentY);
  pdf.text("Data: ___/___/______", 15, currentY + 8);

  // Campo do inspecionador
  currentY += 40;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("INSPECIONADOR:", 15, currentY);

  currentY += 20;
  pdf.line(15, currentY, pageWidth - 15, currentY);
  pdf.setFontSize(10);
  pdf.text("Nome do Inspecionador", pageWidth / 2, currentY + 8, {
    align: "center",
  });

  currentY += 20;
  pdf.line(15, currentY, pageWidth - 15, currentY);
  pdf.text("Assinatura do Inspecionador", pageWidth / 2, currentY + 8, {
    align: "center",
  });

  currentY += 20;
  pdf.line(15, currentY, pageWidth - 15, currentY);
  pdf.text("Data: ___/___/______", 15, currentY + 8);

  // Observações finais
  currentY += 40;
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("OBSERVAÇÕES FINAIS:", 15, currentY);

  currentY += 10;
  const alturaObsFinal = 30;
  pdf.setFillColor(250, 250, 250);
  pdf.rect(15, currentY, pageWidth - 30, alturaObsFinal, "F");
  pdf.rect(15, currentY, pageWidth - 30, alturaObsFinal, "S");
}

/**
 * Busca dados do checklist do banco de dados
 */
async function buscarDadosChecklist(checklistId) {
  try {
    // Simular busca no banco de dados
    // Em uma implementação real, isso faria uma consulta ao banco SQLite
    const checklistData = localStorage.getItem("checklistData");
    const step2Data = localStorage.getItem("step2Data");

    if (!checklistData) {
      throw new Error("Dados do checklist não encontrados");
    }

    const dados = JSON.parse(checklistData);
    const dadosStep2 = step2Data ? JSON.parse(step2Data) : {};

    return {
      id: checklistId,
      motorista: dados.nomeMotorista || "Não informado",
      placa: dados.placaVeiculo || "Não informado",
      data: dados.dataExecucao || new Date().toLocaleDateString("pt-BR"),
      verifications: dadosStep2.verifications || [],
      media: dadosStep2.media || [],
    };
  } catch (error) {
    console.error("Erro ao buscar dados do checklist:", error);
    return null;
  }
}

/**
 * Função principal para gerar PDF do checklist Basell
 */
async function generateBasellPdf(checklistId) {
  try {
    console.log("Iniciando geração de PDF para checklist:", checklistId);

    // Verificar se jsPDF está disponível
    if (typeof window.jsPDF === "undefined") {
      throw new Error(
        "jsPDF não está carregado. Certifique-se de incluir a biblioteca jsPDF."
      );
    }

    // Buscar dados do checklist
    const checklist = await buscarDadosChecklist(checklistId);
    if (!checklist) {
      throw new Error("Não foi possível carregar os dados do checklist");
    }

    // Criar novo documento PDF
    const pdf = new window.jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.width;
    let pageNumber = 1;

    // Adicionar cabeçalho
    addHeaderToPage(pdf);

    // Informações do checklist
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("INFORMAÇÕES DO CHECKLIST", 15, 40);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    let currentY = 50;
    pdf.text(
      `Motorista: ${limparTextoParaPdf(checklist.motorista)}`,
      15,
      currentY
    );
    currentY += 8;
    pdf.text(
      `Placa do Veículo: ${limparTextoParaPdf(checklist.placa)}`,
      15,
      currentY
    );
    currentY += 8;
    pdf.text(`Data de Execução: ${checklist.data}`, 15, currentY);
    currentY += 15;

    // Tabela com itens 1-9
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(29, 95, 181);
    pdf.text("ITENS DE VERIFICAÇÃO (1 a 9)", 15, currentY);
    currentY += 10;

    // Cabeçalho da tabela
    const colDescricaoWidth = 120;
    const colStatusWidth = 35;
    const colObservacaoWidth = 35;
    const alturaLinha = 12;

    pdf.setFillColor(240, 248, 255);
    pdf.rect(15, currentY, colDescricaoWidth, alturaLinha, "F");
    pdf.rect(
      15 + colDescricaoWidth,
      currentY,
      colStatusWidth,
      alturaLinha,
      "F"
    );
    pdf.rect(
      15 + colDescricaoWidth + colStatusWidth,
      currentY,
      colObservacaoWidth,
      alturaLinha,
      "F"
    );

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("DESCRIÇÃO", 15 + 3, currentY + 8);
    pdf.text(
      "STATUS",
      15 + colDescricaoWidth + colStatusWidth / 2,
      currentY + 8,
      { align: "center" }
    );
    pdf.text(
      "OBSERVAÇÃO",
      15 + colDescricaoWidth + colStatusWidth + 3,
      currentY + 8
    );

    currentY += alturaLinha;

    // Itens 1-9
    verificationItems1.forEach((item) => {
      const verification =
        checklist.verifications.find((v) => v.id === item.id) || {};
      const status = verification.status || "Pendente";
      const observacao = verification.observation || "";

      const statusProcessado = processarStatusParaPdf(status);
      const descricaoLimpa = limparTextoParaPdf(item.question, 60);
      const observacaoLimpa = limparTextoParaPdf(observacao, 20);

      // Quebrar texto em linhas
      const linhasDescricao = pdf.splitTextToSize(
        descricaoLimpa,
        colDescricaoWidth - 6
      );
      const linhasObservacao = pdf.splitTextToSize(
        observacaoLimpa,
        colObservacaoWidth - 6
      );
      const maxLinhas = Math.max(
        linhasDescricao.length,
        linhasObservacao.length,
        1
      );
      const alturaLinhaItem = Math.max(alturaLinha, maxLinhas * 5 + 4);

      // Verificar se precisa de nova página
      if (currentY + alturaLinhaItem > pageWidth * 1.4) {
        pdf.addPage();
        pageNumber++;
        addHeaderToPage(pdf);
        currentY = 50;
      }

      // Desenhar células
      pdf.setFillColor(255, 255, 255);
      pdf.rect(15, currentY, colDescricaoWidth, alturaLinhaItem, "F");
      pdf.rect(
        15 + colDescricaoWidth,
        currentY,
        colStatusWidth,
        alturaLinhaItem,
        "F"
      );
      pdf.rect(
        15 + colDescricaoWidth + colStatusWidth,
        currentY,
        colObservacaoWidth,
        alturaLinhaItem,
        "F"
      );

      // Bordas
      pdf.rect(15, currentY, colDescricaoWidth, alturaLinhaItem);
      pdf.rect(
        15 + colDescricaoWidth,
        currentY,
        colStatusWidth,
        alturaLinhaItem
      );
      pdf.rect(
        15 + colDescricaoWidth + colStatusWidth,
        currentY,
        colObservacaoWidth,
        alturaLinhaItem
      );

      // Textos
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const yTextoBase = currentY + 5;

      // Descrição
      linhasDescricao.forEach((linha, i) => {
        pdf.text(linha, 15 + 3, yTextoBase + i * 5);
      });

      // Status
      pdf.text(
        statusProcessado,
        15 + colDescricaoWidth + colStatusWidth / 2,
        currentY + alturaLinhaItem / 2,
        { align: "center" }
      );

      // Observação
      linhasObservacao.forEach((linha, i) => {
        if (linha.trim()) {
          pdf.text(
            linha,
            15 + colDescricaoWidth + colStatusWidth + 3,
            yTextoBase + i * 5
          );
        }
      });

      currentY += alturaLinhaItem;
    });

    // NOVA PÁGINA PARA ITENS 10-14
    pdf.addPage();
    pageNumber++;
    addHeaderToPage(pdf);

    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(29, 95, 181);
    pdf.text("ITENS DE VERIFICAÇÃO COM IMAGENS (10 a 14)", 15, 50);

    // Processar itens com vídeo (10-14)
    for (let idx = 0; idx < verificationItems2.length; idx++) {
      const item = verificationItems2[idx];
      const itemNum = idx + 10;

      // Nova página para cada item (exceto o primeiro)
      if (idx > 0) {
        pdf.addPage();
        pageNumber++;
        addHeaderToPage(pdf);
      }

      // Título do item
      const descricaoLimpa = limparTextoParaPdf(item.question);
      const tituloItem = `Item ${itemNum}: ${descricaoLimpa}`;
      const tituloLimitado = limparTextoParaPdf(tituloItem, 80);

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(29, 95, 181);
      pdf.setFillColor(240, 248, 255);

      const yTitulo = idx === 0 ? 65 : 50;
      pdf.rect(15, yTitulo, pageWidth - 30, 10, "F");
      pdf.rect(15, yTitulo, pageWidth - 30, 10, "S");
      pdf.text(tituloLimitado, pageWidth / 2, yTitulo + 7, { align: "center" });

      // Buscar mídia relacionada ao item
      const mediaRelacionada =
        checklist.media.filter((m) => m.pergunta_id === item.id) || [];
      let frames = [];

      try {
        if (mediaRelacionada.length > 0) {
          // Processar mídia real
          for (const media of mediaRelacionada.slice(0, 12)) {
            try {
              if (media.tipo === "foto") {
                const canvas = await criarCanvasDeImagem(media.file_path);
                frames.push(canvas);
              } else if (media.tipo === "video") {
                const videoFrames = await extrairFramesVideo(
                  media.file_path,
                  Math.min(12 - frames.length, 4)
                );
                frames.push(...videoFrames);
              }
            } catch (error) {
              console.error(`Erro ao processar mídia ${media.id}:`, error);
              frames.push(criarFramePlaceholder());
            }
          }
        }

        // Completar com placeholders se necessário
        while (frames.length < 12) {
          frames.push(criarFramePlaceholder());
        }
      } catch (error) {
        console.error(`Erro ao processar mídia do item ${itemNum}:`, error);
        // Criar placeholders em caso de erro
        for (let i = 0; i < 12; i++) {
          frames.push(criarFramePlaceholder());
        }
      }

      // Posicionar após título
      let currentYPosition = yTitulo + 18;

      // Texto informativo
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text(
        `IMAGENS EXTRAÍDAS DO VÍDEO DE INSPEÇÃO (${frames.length} fotos):`,
        15,
        currentYPosition
      );

      currentYPosition += 10;

      // Adicionar layout de frames
      currentYPosition = adicionarLayoutFramesSimple(
        pdf,
        frames,
        currentYPosition
      );

      // Buscar observação do item
      const verification =
        checklist.verifications.find((v) => v.id === item.id) || {};
      const observacao = verification.observation || "";

      // Adicionar campo de observação
      currentYPosition = adicionarCampoObservacaoSimpleWithText(
        pdf,
        currentYPosition,
        observacao
      );
    }

    // PÁGINA DE ASSINATURAS
    pdf.addPage();
    pageNumber++;
    addHeaderToPage(pdf);
    adicionarPaginaAssinaturasSimple(pdf, checklist.motorista);

    // Adicionar rodapés a todas as páginas
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooterToPage(pdf, i);
    }

    // Salvar arquivo
    const nomeArquivo = `checklist-basell-${limparTextoParaPdf(
      checklist.motorista
    ).replace(/\s+/g, "-")}-${limparTextoParaPdf(checklist.placa)}.pdf`;
    pdf.save(nomeArquivo);

    console.log("PDF gerado com sucesso:", nomeArquivo);
    return true;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    alert("Erro ao gerar PDF: " + error.message);
    return false;
  }
}

// Exportar função para uso global
window.generateBasellPdf = generateBasellPdf;
