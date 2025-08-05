const { Client } = require("pg");
require("dotenv").config({ path: "../.env" });

// Configurações do banco de dados como superusuário
const superUserConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: "postgres", // Usuário com privilégios administrativos
  password: "megavale", // Senha do postgres
};

console.log("🔧 Corrigindo permissões da tabela ChecklistBasell...");
console.log("📋 Conectando como superusuário postgres...");

async function fixPermissions() {
  const client = new Client(superUserConfig);

  try {
    // Conectar ao banco como superusuário
    await client.connect();
    console.log("✅ Conexão estabelecida como postgres!");

    // Conceder permissões na tabela ChecklistBasell
    console.log('\n🔐 Concedendo permissões na tabela "ChecklistBasell"...');

    const grantQueries = [
      // Conceder todas as permissões na tabela para o usuário checklist_user
      'GRANT ALL PRIVILEGES ON TABLE public."ChecklistBasell" TO checklist_user;',

      // Conceder permissões na sequência (para auto-increment)
      "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO checklist_user;",

      // Conceder permissões de uso no schema
      "GRANT USAGE ON SCHEMA public TO checklist_user;",

      // Conceder permissões padrão para futuras tabelas
      "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO checklist_user;",
      "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO checklist_user;",
    ];

    for (const query of grantQueries) {
      try {
        await client.query(query);
        console.log("✅ Executado:", query.substring(0, 50) + "...");
      } catch (error) {
        console.log("⚠️  Aviso ao executar:", query.substring(0, 50) + "...");
        console.log("   Erro:", error.message);
      }
    }

    console.log("\n🎉 Permissões configuradas com sucesso!");

    // Testar se as permissões funcionaram
    console.log("\n🧪 Testando acesso com o usuário checklist_user...");
  } catch (error) {
    console.error("❌ Erro ao configurar permissões:");
    console.error("📝 Detalhes:", error.message);
    console.error("🔍 Código:", error.code);
  } finally {
    await client.end();
    console.log("\n🔌 Conexão fechada.");
  }
}

// Executar correção de permissões
fixPermissions();
