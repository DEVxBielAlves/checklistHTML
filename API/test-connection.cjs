require("dotenv").config({ path: "../.env" });
const { Sequelize } = require("sequelize");

console.log("🔍 Testando conexão PostgreSQL...");
console.log("Configurações:");
console.log("- DB_NAME:", process.env.DB_NAME);
console.log("- DB_USER:", process.env.DB_USER);
console.log("- DB_HOST:", process.env.DB_HOST);
console.log("- DB_PORT:", process.env.DB_PORT);
console.log("- DB_DIALECT:", process.env.DB_DIALECT);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: console.log,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Conexão PostgreSQL estabelecida com sucesso!");
    console.log("✅ Banco de dados checklist_db está acessível!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Erro na conexão PostgreSQL:");
    console.error("Código do erro:", err.name);
    console.error("Mensagem:", err.message);
    console.error("\n🔧 Possíveis soluções:");
    console.error("1. Verificar se o PostgreSQL está rodando");
    console.error('2. Verificar se o usuário "checklist_user" existe');
    console.error("3. Verificar se a senha está correta");
    console.error('4. Verificar se o banco "checklist_db" existe');
    process.exit(1);
  });
