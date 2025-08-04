const dotenv = require("dotenv");
const path = require("path");

// Carregar .env da pasta pai
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("🔍 Testando variáveis de ambiente na pasta API:");
console.log("DB_DIALECT:", process.env.DB_DIALECT);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "***" : "undefined");
