/**
 * MODELO PDF 2 - Baseado no código Python pdf_fpdf.py
 *
 * Este modelo gera um PDF completo com todas as funcionalidades do modelo Python:
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
 * import { generateModel2Pdf } from '@/pdf/models/model2';
 *
 * // Dentro de um componente React
 * const handleGeneratePdf = async () => {
 *   try {
 *     await generateModel2Pdf(checklistState);
 *   } catch (error) {
 *     console.error('Erro ao gerar PDF:', error);
 *   }
 * };
 */

import jsPDF from "jspdf";
import type { ChecklistState, MediaItem } from "@/types/checklist";
import {
  verificationItems1,
  verificationItems2,
} from "@/utils/checklist-items";
import { PDFHelpers, pdfUtils } from "../utils/pdfHelpers";
import { PDF_CONSTANTS, STATUS_COLORS } from "../constants/pdfConstants";

/**
 * Processa mídia do checklist Basell
 * @param mediaItems - Array de itens de mídia do checklist
 * @param perguntaId - ID da pergunta para filtrar mídia
 * @param maxSlots - Número máximo de slots disponíveis (padrão: 12)
 * @returns Array de HTMLCanvasElement com a mídia processada
 */
async function processarMidiaBasell(
  mediaItems: MediaItem[],
  perguntaId: number,
  maxSlots: number = 12
): Promise<HTMLCanvasElement[]> {
  const resultado: HTMLCanvasElement[] = [];

  // Filtrar mídia relacionada à pergunta
  const mediaRelacionada = mediaItems.filter(
    (m) => m.pergunta_id === perguntaId
  );

  if (mediaRelacionada.length === 0) {
    // Criar placeholders se não houver mídia
    for (let i = 0; i < maxSlots; i++) {
      resultado.push(criarFramePlaceholder());
    }
    return resultado;
  }

  // Separar fotos e vídeos
  const fotos = mediaRelacionada.filter((m) => m.tipo === "foto");
  const videos = mediaRelacionada.filter((m) => m.tipo === "video");

  // 1. PRIMEIRA PRIORIDADE: Adicionar fotos/imagens estáticas
  for (const foto of fotos) {
    if (resultado.length >= maxSlots) break;

    try {
      const canvas = await criarCanvasDeImagem(foto.file_path);
      resultado.push(canvas);
    } catch (error) {
      console.error("Erro ao processar foto:", error);
      resultado.push(criarFramePlaceholder());
    }
  }

  // 2. SEGUNDA PRIORIDADE: Frames extraídos de vídeos
  for (const video of videos) {
    if (resultado.length >= maxSlots) break;

    try {
      const slotsRestantes = maxSlots - resultado.length;
      const framesDoVideo = await extrairFramesVideo(
        video.file_path,
        Math.min(slotsRestantes, 4)
      );

      // Adicionar frames até o limite
      for (const frame of framesDoVideo) {
        if (resultado.length >= maxSlots) break;
        resultado.push(frame);
      }
    } catch (error) {
      console.error("Erro ao extrair frames do vídeo:", error);
      // Adicionar um placeholder para este vídeo
      if (resultado.length < maxSlots) {
        resultado.push(criarFramePlaceholder());
      }
    }
  }

  // 3. Completar com placeholders se necessário
  while (resultado.length < maxSlots) {
    resultado.push(criarFramePlaceholder());
  }

  return resultado;
}

/**
 * Cria um canvas a partir de uma imagem
 * @param imageUrl - URL da imagem (data URI ou blob URL)
 * @returns Promise<HTMLCanvasElement>
 */
async function criarCanvasDeImagem(
  imageUrl: string
): Promise<HTMLCanvasElement> {
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
 * Converte caracteres especiais para compatibilidade com PDF
 * Equivalente à função limpar_texto_para_pdf do Python
 */
function limparTextoParaPdf(texto: string, maxLength?: number): string {
  if (!texto) return "";

  texto = String(texto);

  // Mapeamento de caracteres acentuados
  const mapaAcentos: Record<string, string> = {
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
 * Equivalente à função processar_status_para_pdf do Python
 */
function processarStatusParaPdf(status: string): string {
  if (!status) {
    return "⏳ Pendente";
  }

  // ✅ Adicionar log para debug
  console.log("🔍 Processando status para PDF:", status);

  // Mapeamento completo e robusto para todos os casos de status
  const statusMapping: Record<string, string> = {
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
    "1": "✅ Conforme",
    "0": "❌ Não Conforme",
  };

  const resultado = statusMapping[status] || "⏳ Pendente";
  console.log("✅ Status mapeado:", status, "->", resultado);
  return resultado;
}

/**
 * Cria um frame placeholder quando não é possível extrair do vídeo
 */
function criarFramePlaceholder(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");

  try {
    // Validar e definir dimensões
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
 * Extrai frames de um vídeo usando canvas
 */
async function extrairFramesVideo(
  videoUrl: string,
  numFrames: number = 12
): Promise<HTMLCanvasElement[]> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "metadata";

    const frames: HTMLCanvasElement[] = [];

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

    // Adicionar handler para loadeddata também
    video.addEventListener("loadeddata", () => {
      // Verificar se as dimensões estão disponíveis
      if (
        !isFinite(video.videoWidth) ||
        !isFinite(video.videoHeight) ||
        video.videoWidth <= 0 ||
        video.videoHeight <= 0
      ) {
        console.warn("Dimensões do vídeo não disponíveis em loadeddata");
      }
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
 * Classe personalizada de PDF com cabeçalho e rodapé
 * Equivalente à DocumentoComRodapeSeletivo do Python
 */
class DocumentoComRodapeSeletivo extends jsPDF {
  public pageNumber: number = 0;

  constructor() {
    super("p", "mm", "a4");
    // Configurar margens
    this.setFontSize(12);

    // Bind methods to ensure proper context
    this.addHeader = this.addHeader.bind(this);
    this.addFooter = this.addFooter.bind(this);
    this.finalizePdf = this.finalizePdf.bind(this);
  }

  /**
   * Adiciona cabeçalho personalizado
   */
  addHeader(): void {
    // Título centralizado
    this.setFontSize(14);
    this.setFont("helvetica", "bold");
    this.setTextColor(29, 95, 181); // #1d5fb5

    const titulo = "Checklist de Carreta - MegaVale";
    const pageWidth = this.internal.pageSize.width;
    const textWidth = this.getTextWidth(titulo);
    const x = (pageWidth - textWidth) / 2;

    this.text(titulo, x, 20);

    // Linha decorativa
    this.setDrawColor(29, 95, 181);
    this.setLineWidth(0.5);
    this.line(15, 25, pageWidth - 15, 25);
  }

  /**
   * Adiciona rodapé (apenas na primeira página)
   */
  addFooter(): void {
    const pageHeight = this.internal.pageSize.height;
    const pageWidth = this.internal.pageSize.width;

    // Verificar se é primeira página
    if (this.pageNumber === 1) {
      // Nome da empresa
      this.setFontSize(10);
      this.setFont("helvetica", "bold");
      this.setTextColor(0, 0, 0);
      const empresa = limparTextoParaPdf("MegaVale Transporte & Logística");
      this.text(empresa, pageWidth / 2, pageHeight - 25, { align: "center" });

      // Texto do relatório
      this.setFontSize(9);
      this.setFont("helvetica", "normal");
      this.setTextColor(100, 100, 100);
      const relatorio = limparTextoParaPdf(
        "Relatório gerado automaticamente pelo Sistema de Checklist MegaVale."
      );
      this.text(relatorio, pageWidth / 2, pageHeight - 20, { align: "center" });

      // Data
      const dataHora = new Date().toLocaleString("pt-BR");
      this.text(`Data: ${dataHora}`, pageWidth / 2, pageHeight - 15, {
        align: "center",
      });
    }

    // Numeração de páginas (em todas as páginas)
    this.setFontSize(8);
    this.setTextColor(128, 128, 128);
    this.text(`Página ${this.pageNumber}`, pageWidth / 2, pageHeight - 5, {
      align: "center",
    });
  }

  addPage(): this {
    super.addPage();
    this.pageNumber++;
    try {
      this.addHeader();
    } catch (error) {
      console.warn(
        "Erro ao chamar addHeader em addPage, usando função helper:",
        error
      );
      addHeaderToPage(this);
    }
    return this;
  }

  /**
   * Método para finalizar o PDF e adicionar rodapés
   */
  finalizePdf(): void {
    const totalPages = this.getNumberOfPages();

    // Percorrer todas as páginas para adicionar rodapés
    for (let i = 1; i <= totalPages; i++) {
      this.setPage(i);
      this.pageNumber = i;
      try {
        this.addFooter();
      } catch (error) {
        console.warn("Erro ao chamar addFooter, usando função helper:", error);
        addFooterToPage(this, i);
      }
    }
  }
}

/**
 * Adiciona layout de frames em grade 4x3 (12 imagens)
 */
function adicionarLayoutFrames(
  pdf: DocumentoComRodapeSeletivo,
  frames: HTMLCanvasElement[],
  currentY: number
): number {
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
 * Adiciona campo de observação
 */
function adicionarCampoObservacao(
  pdf: DocumentoComRodapeSeletivo,
  currentY: number
): number {
  const pageWidth = pdf.internal.pageSize.width;
  const larguraDisponivel = pageWidth - 30;
  const alturaObservacao = 40;

  // Título do campo de observação
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(29, 95, 181);
  pdf.setFillColor(240, 248, 255);

  const yPos = currentY;

  // Retângulo para título
  pdf.rect(15, yPos, larguraDisponivel, 10, "F");
  pdf.rect(15, yPos, larguraDisponivel, 10, "S");
  pdf.text("CAMPO DE OBSERVAÇÃO", pageWidth / 2, yPos + 7, { align: "center" });

  // Área para observações
  pdf.setDrawColor(150, 150, 150);
  pdf.rect(15, yPos + 10, larguraDisponivel, alturaObservacao);

  // Linhas internas
  for (let i = 1; i < 6; i++) {
    const yLinha = yPos + 10 + i * 6;
    pdf.line(20, yLinha, pageWidth - 20, yLinha);
  }

  // Retornar nova posição Y
  return yPos + 10 + alturaObservacao + 10;
}

/**
 * Adiciona página de assinaturas
 */
function adicionarPaginaAssinaturas(
  pdf: DocumentoComRodapeSeletivo,
  nomeMotorista: string
): void {
  pdf.addPage();

  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;

  // Título das assinaturas
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(29, 95, 181);
  pdf.setFillColor(240, 248, 255);

  const yTitulo = 50;
  pdf.rect(15, yTitulo, pageWidth - 30, 12, "F");
  pdf.text("ASSINATURAS", pageWidth / 2, yTitulo + 8, { align: "center" });

  // Configurações das colunas
  const larguraTotal = pageWidth - 30;
  const larguraColuna = (larguraTotal - 10) / 2;
  const alturaBloco = 45;
  const yInicioAssinaturas = yTitulo + 20;

  // Fundos para os campos
  pdf.setFillColor(248, 248, 248);
  pdf.rect(15, yInicioAssinaturas, larguraColuna, alturaBloco, "F");
  pdf.rect(
    15 + larguraColuna + 10,
    yInicioAssinaturas,
    larguraColuna,
    alturaBloco,
    "F"
  );

  // Bordas
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(15, yInicioAssinaturas, larguraColuna, alturaBloco);
  pdf.rect(
    15 + larguraColuna + 10,
    yInicioAssinaturas,
    larguraColuna,
    alturaBloco
  );

  // Cabeçalhos das colunas
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);

  pdf.text("MOTORISTA", 15 + larguraColuna / 2, yInicioAssinaturas + 10, {
    align: "center",
  });
  pdf.text(
    "INSPECIONADOR",
    15 + larguraColuna + 10 + larguraColuna / 2,
    yInicioAssinaturas + 10,
    { align: "center" }
  );

  // Linhas para assinatura
  const yLinha = yInicioAssinaturas + 25;
  pdf.setDrawColor(0, 0, 0);
  pdf.line(25, yLinha, 15 + larguraColuna - 10, yLinha);
  pdf.line(25 + larguraColuna + 10, yLinha, pageWidth - 25, yLinha);

  // Nomes
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  const nomeLimitado =
    nomeMotorista.length > 25 ? nomeMotorista.substring(0, 25) : nomeMotorista;
  pdf.text(nomeLimitado, 15 + larguraColuna / 2, yLinha + 8, {
    align: "center",
  });
  pdf.text(
    "NOME DO INSPECIONADOR",
    15 + larguraColuna + 10 + larguraColuna / 2,
    yLinha + 8,
    { align: "center" }
  );

  // Responsabilidades
  pdf.text(
    "Responsável pelo Recebimento",
    15 + larguraColuna / 2,
    yLinha + 15,
    { align: "center" }
  );
  pdf.text(
    "Responsável pela Inspeção",
    15 + larguraColuna + 10 + larguraColuna / 2,
    yLinha + 15,
    { align: "center" }
  );

  // Data de assinatura
  const dataAssinatura = `Data: ___/___/${new Date().getFullYear()}     Local: ________________________`;
  pdf.text(dataAssinatura, pageWidth / 2, yLinha + 30, { align: "center" });
}

/**
 * Helper functions for PDF generation
 */
const addHeaderToPage = (pdf: jsPDF): void => {
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
};

const addFooterToPage = (pdf: jsPDF, pageNumber: number): void => {
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
};

// Simple helper functions for regular jsPDF
const adicionarLayoutFramesSimple = (
  pdf: jsPDF,
  frames: HTMLCanvasElement[],
  currentY: number
): number => {
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
  const margemDireita = 15;
  const larguraDisponivel = pageWidth - margemEsquerda - margemDireita;

  // Layout 4x3 (12 imagens)
  const colunas = 4;
  const linhas = 3;
  const espacamentoEntreImagens = 3;
  const larguraImagem =
    (larguraDisponivel - espacamentoEntreImagens * (colunas - 1)) / colunas;
  const alturaImagem = larguraImagem * 0.75; // Proporção 4:3

  let yPos = currentY;

  for (let linha = 0; linha < linhas; linha++) {
    for (let coluna = 0; coluna < colunas; coluna++) {
      const indiceFrame = linha * colunas + coluna;

      if (indiceFrame < frames.length) {
        const frame = frames[indiceFrame];
        const x =
          margemEsquerda + coluna * (larguraImagem + espacamentoEntreImagens);
        const y = yPos;

        try {
          // Validar canvas antes de converter
          if (
            !frame ||
            !frame.width ||
            !frame.height ||
            !isFinite(frame.width) ||
            !isFinite(frame.height) ||
            frame.width <= 0 ||
            frame.height <= 0
          ) {
            throw new Error("Canvas inválido");
          }

          // Validar posição e dimensões do PDF
          if (
            !isFinite(x) ||
            !isFinite(y) ||
            !isFinite(larguraImagem) ||
            !isFinite(alturaImagem) ||
            x < 0 ||
            y < 0 ||
            larguraImagem <= 0 ||
            alturaImagem <= 0
          ) {
            throw new Error("Posição ou dimensões inválidas para o PDF");
          }

          // Converter canvas para data URL
          const dataURL = frame.toDataURL("image/jpeg", 0.8);

          // Validar data URL
          if (!dataURL || !dataURL.startsWith("data:image/")) {
            throw new Error("Data URL inválida");
          }

          pdf.addImage(dataURL, "JPEG", x, y, larguraImagem, alturaImagem);
        } catch (error) {
          console.error("Erro ao adicionar imagem:", error);
          // Desenhar retângulo placeholder
          try {
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(x, y, larguraImagem, alturaImagem);
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(
              `Frame ${indiceFrame + 1}`,
              x + larguraImagem / 2,
              y + alturaImagem / 2,
              { align: "center" }
            );
          } catch (placeholderError) {
            console.error("Erro ao desenhar placeholder:", placeholderError);
          }
        }
      }
    }
    yPos += alturaImagem + espacamentoEntreImagens;
  }

  return yPos + 10;
};

const adicionarCampoObservacaoSimpleWithText = (
  pdf: jsPDF,
  currentY: number,
  observacaoTexto: string
): number => {
  const pageWidth = pdf.internal.pageSize.width;
  const larguraDisponivel = pageWidth - 30;
  const alturaObservacao = 40;

  // Título do campo de observação
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(29, 95, 181);
  pdf.setFillColor(240, 248, 255);

  const yPos = currentY;

  // Retângulo para título
  pdf.rect(15, yPos, larguraDisponivel, 10, "F");
  pdf.rect(15, yPos, larguraDisponivel, 10, "S");
  pdf.text("CAMPO DE OBSERVAÇÃO", pageWidth / 2, yPos + 7, { align: "center" });

  // Área para observações
  pdf.setDrawColor(150, 150, 150);
  pdf.rect(15, yPos + 10, larguraDisponivel, alturaObservacao);

  // Se há observação específica, adicioná-la ao campo
  if (observacaoTexto) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);

    // Limpar e processar texto da observação
    const observacaoLimpa = limparTextoParaPdf(observacaoTexto, 120);

    // Quebrar texto em linhas se necessário
    const linhasObservacao = pdf.splitTextToSize(
      observacaoLimpa,
      larguraDisponivel - 20
    );

    // Adicionar texto da observação
    let yTexto = yPos + 18;
    for (let i = 0; i < linhasObservacao.length && i < 5; i++) {
      pdf.text(linhasObservacao[i], 20, yTexto);
      yTexto += 6;
    }
  }

  // Linhas internas (mantendo para preenchimento manual se necessário)
  pdf.setDrawColor(150, 150, 150);
  for (let i = 1; i < 6; i++) {
    const yLinha = yPos + 10 + i * 6;
    pdf.line(20, yLinha, pageWidth - 20, yLinha);
  }

  // Retornar nova posição Y
  return yPos + 10 + alturaObservacao + 10;
};

const adicionarPaginaAssinaturasSimple = (
  pdf: jsPDF,
  nomeMotorista: string
): void => {
  const pageWidth = pdf.internal.pageSize.width;

  // Título das assinaturas
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(29, 95, 181);
  pdf.setFillColor(240, 248, 255);

  const yTitulo = 50;
  pdf.rect(15, yTitulo, pageWidth - 30, 12, "F");
  pdf.text("ASSINATURAS", pageWidth / 2, yTitulo + 8, { align: "center" });

  // Configurações das colunas
  const larguraTotal = pageWidth - 30;
  const larguraColuna = (larguraTotal - 10) / 2;
  const alturaBloco = 45;
  const yInicioAssinaturas = yTitulo + 20;

  // Fundos para os campos
  pdf.setFillColor(248, 248, 248);
  pdf.rect(15, yInicioAssinaturas, larguraColuna, alturaBloco, "F");
  pdf.rect(
    15 + larguraColuna + 10,
    yInicioAssinaturas,
    larguraColuna,
    alturaBloco,
    "F"
  );

  // Bordas
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(15, yInicioAssinaturas, larguraColuna, alturaBloco);
  pdf.rect(
    15 + larguraColuna + 10,
    yInicioAssinaturas,
    larguraColuna,
    alturaBloco
  );

  // Cabeçalhos das colunas
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);

  pdf.text("MOTORISTA", 15 + larguraColuna / 2, yInicioAssinaturas + 10, {
    align: "center",
  });
  pdf.text(
    "INSPECIONADOR",
    15 + larguraColuna + 10 + larguraColuna / 2,
    yInicioAssinaturas + 10,
    { align: "center" }
  );

  // Linhas para assinatura
  const yLinha = yInicioAssinaturas + 25;
  pdf.setDrawColor(0, 0, 0);
  pdf.line(25, yLinha, 15 + larguraColuna - 10, yLinha);
  pdf.line(25 + larguraColuna + 10, yLinha, pageWidth - 25, yLinha);

  // Nomes
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(nomeMotorista, 15 + larguraColuna / 2, yLinha + 10, {
    align: "center",
  });
  pdf.text(
    "_________________",
    15 + larguraColuna + 10 + larguraColuna / 2,
    yLinha + 10,
    { align: "center" }
  );

  // Data
  const dataAssinatura = new Date().toLocaleDateString("pt-BR");
  pdf.text(`Data: ${dataAssinatura}`, pageWidth / 2, yLinha + 30, {
    align: "center",
  });
};

/**
 * Gera PDF Modelo 2 - Versão completa baseada no código Python
 */
export const generateModel2Pdf = async (
  checklist: ChecklistState
): Promise<void> => {
  try {
    // Use simple approach with regular jsPDF
    return await generateModel2PdfSimple(checklist);
  } catch (error) {
    console.error("Erro ao gerar PDF Modelo 2:", error);
    throw error;
  }
};

/**
 * Implementação simples com jsPDF regular
 */
const generateModel2PdfSimple = async (
  checklist: ChecklistState
): Promise<void> => {
  const pdf = new jsPDF();
  let pageNumber = 1;

  // Adicionar cabeçalho na primeira página
  addHeaderToPage(pdf);

  // Extrair dados básicos do checklist
  const nomeMotorista = limparTextoParaPdf(checklist.driverName || "N/A");
  const placaVeiculo = limparTextoParaPdf(checklist.vehiclePlate || "N/A");
  const dataExecucao = limparTextoParaPdf(
    checklist.executionDate
      ? new Date(checklist.executionDate).toLocaleDateString("pt-BR")
      : "N/A"
  );

  // INFORMAÇÕES DO CHECKLIST
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(29, 95, 181);
  pdf.text(limparTextoParaPdf("INFORMAÇÕES DO CHECKLIST"), 15, 50);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Nome do Motorista: ${nomeMotorista}`, 15, 62);
  pdf.text(`Placa do Veículo: ${placaVeiculo}`, 15, 70);
  pdf.text(`Data de Execução: ${dataExecucao}`, 15, 78);

  // ITENS DE VERIFICAÇÃO (1 a 9) - Tabela
  let currentY = 90;
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(29, 95, 181);
  pdf.text(limparTextoParaPdf("ITENS DE VERIFICAÇÃO (1 a 9)"), 15, currentY);

  currentY += 15;

  // Configurar tabela
  const pageWidth = pdf.internal.pageSize.width;
  const larguraTotal = pageWidth - 30;
  const colStatusWidth = 35; // Reduzido de 50 para 35
  const colObservacaoWidth = 100;
  const colDescricaoWidth = larguraTotal - colStatusWidth - colObservacaoWidth;

  // Cabeçalho da tabela
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.setFillColor(29, 95, 181);

  pdf.rect(15, currentY, colDescricaoWidth, 12, "F");
  pdf.rect(15 + colDescricaoWidth, currentY, colStatusWidth, 12, "F");
  pdf.rect(
    15 + colDescricaoWidth + colStatusWidth,
    currentY,
    colObservacaoWidth,
    12,
    "F"
  );

  // Bordas do cabeçalho
  pdf.setDrawColor(0, 0, 0);
  pdf.rect(15, currentY, colDescricaoWidth, 12);
  pdf.rect(15 + colDescricaoWidth, currentY, colStatusWidth, 12);
  pdf.rect(
    15 + colDescricaoWidth + colStatusWidth,
    currentY,
    colObservacaoWidth,
    12
  );

  pdf.text("Descrição", 15 + colDescricaoWidth / 2, currentY + 8, {
    align: "center",
  });
  pdf.text(
    "Status",
    15 + colDescricaoWidth + colStatusWidth / 2,
    currentY + 8,
    { align: "center" }
  );
  pdf.text(
    "Observação",
    15 + colDescricaoWidth + colStatusWidth + colObservacaoWidth / 2,
    currentY + 8,
    { align: "center" }
  );

  currentY += 12;

  // Itens da tabela
  verificationItems1.forEach((item, index) => {
    const itemNum = index + 1;
    const verification = checklist.verifications?.find((v) => v.id === item.id);

    // Usar sempre a função processarStatusParaPdf para garantir mapeamento consistente
    let status = "Pendente";
    if (verification && verification.status) {
      status = verification.status as string;
    }

    const statusProcessado = processarStatusParaPdf(status);
    const observacao = verification?.observation || "";

    // Preparar textos sem truncar
    const descricaoCompleta = `${itemNum}. ${item.question}`;
    const observacaoCompleta = observacao || "";

    // Usar splitTextToSize para quebrar texto automaticamente
    pdf.setFontSize(10);
    const linhasDescricao = pdf.splitTextToSize(
      descricaoCompleta,
      colDescricaoWidth - 6
    );
    const linhasObservacao = observacaoCompleta
      ? pdf.splitTextToSize(observacaoCompleta, colObservacaoWidth - 6)
      : [""];

    // Calcular altura necessária baseada no número de linhas
    const maxLinhas = Math.max(
      linhasDescricao.length,
      linhasObservacao.length,
      1
    );
    const alturaLinha = Math.max(10, maxLinhas * 5 + 4);

    // Alternar cores de fundo
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
    } else {
      pdf.setFillColor(255, 255, 255);
    }

    // Verificar quebra de página
    if (currentY + alturaLinha > pdf.internal.pageSize.height - 50) {
      pdf.addPage();
      pageNumber++;
      addHeaderToPage(pdf);
      currentY = 50;
    }

    // Desenhar células
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

    // Bordas
    pdf.rect(15, currentY, colDescricaoWidth, alturaLinha);
    pdf.rect(15 + colDescricaoWidth, currentY, colStatusWidth, alturaLinha);
    pdf.rect(
      15 + colDescricaoWidth + colStatusWidth,
      currentY,
      colObservacaoWidth,
      alturaLinha
    );

    // Textos - posicionar no centro vertical da célula
    const yTextoBase = currentY + 5;

    // Descrição (múltiplas linhas)
    linhasDescricao.forEach((linha: string, i: number) => {
      pdf.text(linha, 15 + 3, yTextoBase + i * 5);
    });

    // Status (centralizado verticalmente)
    pdf.text(
      statusProcessado,
      15 + colDescricaoWidth + colStatusWidth / 2,
      currentY + alturaLinha / 2,
      { align: "center" }
    );

    // Observação (múltiplas linhas)
    linhasObservacao.forEach((linha: string, i: number) => {
      if (linha.trim()) {
        pdf.text(
          linha,
          15 + colDescricaoWidth + colStatusWidth + 3,
          yTextoBase + i * 5
        );
      }
    });

    currentY += alturaLinha;
  });

  // NOVA PÁGINA PARA ITENS 10-14
  pdf.addPage();
  pageNumber++;
  addHeaderToPage(pdf);

  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(29, 95, 181);
  pdf.text(
    limparTextoParaPdf("ITENS DE VERIFICAÇÃO COM IMAGENS (10 a 14)"),
    15,
    50
  );

  // Processar itens com vídeo (10-14)
  const videoItems = verificationItems2;

  for (let idx = 0; idx < videoItems.length; idx++) {
    const item = videoItems[idx];
    const itemNum = idx + 10; // Itens 10-14

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
      checklist.media?.filter((m) => m.pergunta_id === item.id) || [];
    let frames: HTMLCanvasElement[] = [];

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
    const verification = checklist.verifications?.find((v) => v.id === item.id);
    const observacao = verification?.observation || "";

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
  adicionarPaginaAssinaturasSimple(pdf, nomeMotorista);

  // Adicionar rodapés a todas as páginas
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooterToPage(pdf, i);
  }

  // Salvar arquivo
  const nomeArquivo = `checklist-modelo2-${limparTextoParaPdf(
    nomeMotorista
  ).replace(/\s+/g, "-")}-${limparTextoParaPdf(placaVeiculo)}.pdf`;
  pdf.save(nomeArquivo);
};

// Removed the problematic generateModel2PdfWithCustomClass function
