import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configuração para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env na raiz do projeto
dotenv.config({ path: path.join(__dirname, "../.env") });

// Configuração do banco de dados (SQLite ou PostgreSQL)
let sequelize;

if (process.env.DB_DIALECT === "sqlite") {
  // Configuração para SQLite
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.DB_STORAGE || "checklist.db",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  });
} else {
  // Configuração para PostgreSQL
  sequelize = new Sequelize(
    process.env.DB_NAME || "checklist_db",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "password",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

// Teste de conexão
async function testarConexao() {
  try {
    await sequelize.authenticate();
    console.log("Conexão estabelecida com sucesso!");
    return true; // Retorna true em caso de sucesso
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
    return false; // Retorna false em caso de erro
  }
}

export { sequelize, testarConexao };
