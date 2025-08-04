require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('🔍 Testando conexão PostgreSQL...');
console.log('DB_DIALECT:', process.env.DB_DIALECT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
  logging: false
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexão PostgreSQL estabelecida com sucesso!');
    console.log('🎯 Banco de dados checklist_db conectado!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erro na conexão:', err.message);
    console.error('🔧 Verifique se o PostgreSQL está rodando e as credenciais estão corretas.');
    process.exit(1);
  });