const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config({ path: "../.env" });

// Importar configurações e rotas
const { sequelize, testConnection } = require("./config/database");
const checklistRoutes = require("./routes/checklist");

// Criar aplicação Express
const app = express();
const PORT = process.env.API_PORT || 5001;

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8000",
      "http://127.0.0.1:8000",
      "http://127.0.0.1:5500",
    ],
    credentials: true,
  })
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Middleware para log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.use("/api/checklist", checklistRoutes);

// Rota de health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API Checklist está funcionando!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "API Checklist Basell",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      checklist: {
        getAll: "GET /api/checklist",
        getById: "GET /api/checklist/:id",
        create: "POST /api/checklist",
        update: "PUT /api/checklist/:id",
        delete: "DELETE /api/checklist/:id",
        getByDriver: "GET /api/checklist/motorista/:nome",
        getByPlate: "GET /api/checklist/veiculo/:placa",
      },
    },
  });
});

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
    path: req.originalUrl,
  });
});

// Middleware para tratamento de erros
app.use((error, req, res, next) => {
  console.error("Erro na aplicação:", error);
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    error:
      process.env.NODE_ENV === "development" ? error.message : "Erro interno",
  });
});

// Função para inicializar o servidor
const startServer = async () => {
  try {
    // Testar conexão com o banco
    console.log("🔄 Testando conexão com o banco de dados...");
    await testConnection();

    // Sincronizar modelos (sem forçar recriação)
    console.log("🔄 Sincronizando modelos do banco de dados...");
    await sequelize.sync({ force: false });
    console.log("✅ Modelos sincronizados com sucesso!");

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log("🚀 ========================================");
      console.log(`🚀 API Checklist rodando na porta ${PORT}`);
      console.log(`🚀 URL: http://localhost:${PORT}`);
      console.log(`🚀 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🚀 Documentação: http://localhost:${PORT}/`);
      console.log("🚀 ========================================");
    });
  } catch (error) {
    console.error("❌ Erro ao inicializar o servidor:", error);
    process.exit(1);
  }
};

// Tratamento de sinais para encerramento graceful
process.on("SIGINT", async () => {
  console.log("\n🔄 Encerrando servidor...");
  try {
    await sequelize.close();
    console.log("✅ Conexão com banco de dados fechada.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao fechar conexão:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("\n🔄 Encerrando servidor...");
  try {
    await sequelize.close();
    console.log("✅ Conexão com banco de dados fechada.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao fechar conexão:", error);
    process.exit(1);
  }
});

// Inicializar servidor
startServer();

module.exports = app;