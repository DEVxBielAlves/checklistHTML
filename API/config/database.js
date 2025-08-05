const { Sequelize } = require("sequelize");
require("dotenv").config({ path: "../.env" });

// Configuração do banco de dados PostgreSQL
const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "checklist_db",
  username: process.env.DB_USER || "checklist_user",
  password: process.env.DB_PASSWORD || "megavale",
  logging: console.log, // Para debug - pode ser removido em produção
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

// Função para testar a conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexão com PostgreSQL estabelecida com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco de dados:", error);
  }
};

module.exports = {
  sequelize,
  testConnection,
};
