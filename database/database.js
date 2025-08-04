import { Sequelize, DataTypes } from "sequelize";

// Configuração do banco de dados
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "checklist.db",
  logging: console.log,
});

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
