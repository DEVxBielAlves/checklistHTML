/**
 * Servidor Express para Sistema de Checklist
 * Conecta o frontend ao banco de dados Sequelize
 */

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
});

// Importar configurações do banco de dados
import { sequelize } from "../database/database.js";
import { ChecklistBasell } from "../models/checklist.js";

// Importar processador de vídeos
import VideoProcessor from "./videoProcessor.js";

// Configuração para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar aplicação Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares básicos
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:5001",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  // Sem limites de tamanho para arquivos de mídia
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens e vídeos
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos de imagem e vídeo são permitidos!"), false);
    }
  },
});

// Configuração do multer para vídeos (memória)
const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos de vídeo são permitidos!"), false);
    }
  },
});

// Instanciar processador de vídeos
const videoProcessor = new VideoProcessor();

// Servir arquivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.static(path.join(__dirname, "../")));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de teste
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Servidor Express funcionando!",
    timestamp: new Date().toISOString(),
  });
});

// Rotas CRUD para Checklist

// GET - Listar todos os checklists
app.get("/api/checklist", async (req, res) => {
  try {
    const checklists = await ChecklistBasell.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(checklists);
  } catch (error) {
    console.error("Erro ao buscar checklists:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
    });
  }
});

// GET - Buscar checklist por ID
app.get("/api/checklist/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const checklist = await ChecklistBasell.findByPk(id);

    if (!checklist) {
      return res.status(404).json({ error: "Checklist não encontrado" });
    }

    res.json(checklist);
  } catch (error) {
    console.error("Erro ao buscar checklist:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
    });
  }
});

// POST - Criar novo checklist
app.post("/api/checklist", upload.array("midias", 20), async (req, res) => {
  try {
    const checklistData = req.body;

    // Processar arquivos de mídia se houver
    if (req.files && req.files.length > 0) {
      const mediaFiles = req.files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));

      // Adicionar caminhos dos arquivos aos dados do checklist
      checklistData.arquivos_midia = JSON.stringify(mediaFiles);
    }

    const novoChecklist = await ChecklistBasell.create(checklistData);

    res.status(201).json({
      message: "Checklist criado com sucesso!",
      checklist: novoChecklist,
    });
  } catch (error) {
    console.error("Erro ao criar checklist:", error);
    res.status(400).json({
      error: "Erro ao criar checklist",
      message: error.message,
    });
  }
});

// PUT - Atualizar checklist
app.put("/api/checklist/:id", upload.array("midias", 20), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Processar arquivos de mídia se houver
    if (req.files && req.files.length > 0) {
      const mediaFiles = req.files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));

      updateData.arquivos_midia = JSON.stringify(mediaFiles);
    }

    const [updatedRows] = await ChecklistBasell.update(updateData, {
      where: { id },
    });

    if (updatedRows === 0) {
      return res.status(404).json({ error: "Checklist não encontrado" });
    }

    const checklistAtualizado = await ChecklistBasell.findByPk(id);

    res.json({
      message: "Checklist atualizado com sucesso!",
      checklist: checklistAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar checklist:", error);
    res.status(400).json({
      error: "Erro ao atualizar checklist",
      message: error.message,
    });
  }
});

// DELETE - Deletar checklist
app.delete("/api/checklist/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await ChecklistBasell.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      return res.status(404).json({ error: "Checklist não encontrado" });
    }

    res.json({ message: "Checklist deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar checklist:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
    });
  }
});

// ==================== ENDPOINTS DE PROCESSAMENTO DE VÍDEO ====================

// POST - Processar vídeo com streams (sem áudio)
app.post("/api/video/process", videoUpload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo de vídeo enviado" });
    }

    // Validar vídeo
    const validation = videoProcessor.validateVideo(req.file);
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Vídeo inválido",
        details: validation.errors
      });
    }

    // Configurar callback de progresso
    let progressData = { percent: 0 };
    const progressCallback = (progress) => {
      progressData = progress;
      console.log(`Progresso do vídeo: ${progress.percent}%`);
    };

    // Processar vídeo
    const result = await videoProcessor.processVideoStream(
      req.file.buffer,
      req.file.originalname,
      progressCallback
    );

    // Converter para base64
    const base64Result = await videoProcessor.videoToBase64(
      result.processedBuffer,
      req.file.originalname
    );

    res.json({
      success: true,
      message: "Vídeo processado com sucesso (sem áudio)",
      video: {
        ...base64Result,
        originalSize: req.file.size,
        processedSize: result.size,
        compressionRatio: ((req.file.size - result.size) / req.file.size * 100).toFixed(2) + '%'
      },
      processing: {
        removedAudio: true,
        compressed: true,
        format: 'mp4'
      }
    });
  } catch (error) {
    console.error("Erro ao processar vídeo:", error);
    res.status(500).json({
      error: "Erro no processamento do vídeo",
      message: error.message
    });
  }
});

// POST - Processar vídeo grande com chunks
app.post("/api/video/process-large", videoUpload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo de vídeo enviado" });
    }

    // Validar vídeo
    const validation = videoProcessor.validateVideo(req.file);
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Vídeo inválido",
        details: validation.errors
      });
    }

    // Salvar temporariamente para processamento por chunks
    const tempPath = path.join(videoProcessor.tempDir, `temp_${Date.now()}_${req.file.originalname}`);
    await fs.promises.writeFile(tempPath, req.file.buffer);

    // Configurar callback de progresso
    let progressData = { percent: 0 };
    const progressCallback = (progress) => {
      progressData = progress;
      console.log(`Progresso (${progress.phase}): ${progress.percent}%`);
    };

    // Processar vídeo em chunks
    const outputPath = path.join(videoProcessor.outputDir, `processed_${Date.now()}.mp4`);
    const result = await videoProcessor.processLargeVideoInChunks(
      tempPath,
      outputPath,
      progressCallback
    );

    // Converter para base64
    const base64Result = await videoProcessor.videoToBase64(
      result.processedBuffer,
      req.file.originalname
    );

    // Limpar arquivo temporário
    await videoProcessor.cleanup([tempPath]);

    res.json({
      success: true,
      message: "Vídeo grande processado com sucesso (sem áudio)",
      video: {
        ...base64Result,
        originalSize: req.file.size,
        processedSize: result.size,
        compressionRatio: ((req.file.size - result.size) / req.file.size * 100).toFixed(2) + '%'
      },
      processing: {
        method: 'chunks',
        removedAudio: true,
        compressed: true,
        format: 'mp4'
      }
    });
  } catch (error) {
    console.error("Erro ao processar vídeo grande:", error);
    res.status(500).json({
      error: "Erro no processamento do vídeo grande",
      message: error.message
    });
  }
});

// GET - Status do processamento de vídeo
app.get("/api/video/status/:id", (req, res) => {
  // Implementar sistema de status se necessário
  res.json({
    message: "Endpoint de status em desenvolvimento",
    id: req.params.id
  });
});

// GET - Informações de vídeo
app.post("/api/video/info", videoUpload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo de vídeo enviado" });
    }

    // Salvar temporariamente para análise
    const tempPath = path.join(videoProcessor.tempDir, `info_${Date.now()}_${req.file.originalname}`);
    await fs.promises.writeFile(tempPath, req.file.buffer);

    // Obter informações do vídeo
    const videoInfo = await videoProcessor.getVideoInfo(tempPath);

    // Limpar arquivo temporário
    await videoProcessor.cleanup([tempPath]);

    res.json({
      success: true,
      info: videoInfo,
      file: {
        name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error("Erro ao obter informações do vídeo:", error);
    res.status(500).json({
      error: "Erro ao analisar vídeo",
      message: error.message
    });
  }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error("Erro não tratado:", error);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      error: "Erro no upload do arquivo",
      message: error.message,
    });
  }

  res.status(500).json({
    error: "Erro interno do servidor",
    message: error.message,
  });
});

// Rota 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Função para inicializar o servidor
async function iniciarServidor() {
  try {
    // Testar conexão com banco de dados
    await sequelize.authenticate();
    console.log("✅ Conexão com banco de dados estabelecida!");

    // Iniciar servidor sem sincronização automática
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Express rodando na porta ${PORT}`);
      console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(
        `🔧 CORS configurado para portas: 3000, 8000, 5500, 127.0.0.1:5500, 5001`
      );
    });
  } catch (error) {
    console.error("❌ Erro ao inicializar servidor:", error);
    process.exit(1);
  }
}

// Inicializar servidor
iniciarServidor();

export default app;
