const { Client } = require("pg");
require("dotenv").config({ path: "../.env" });

// Configurações do banco de dados a partir do .env
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

console.log("🔗 Tentando conectar ao PostgreSQL...");
console.log("📋 Configurações:", {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: "***",
});

async function testConnection() {
  const client = new Client(dbConfig);

  try {
    // Conectar ao banco
    await client.connect();
    console.log("✅ Conexão com PostgreSQL estabelecida com sucesso!");

    // Testar uma query simples
    const result = await client.query("SELECT NOW() as current_time");
    console.log("⏰ Hora atual do banco:", result.rows[0].current_time);

    // Listar TODAS as tabelas do schema public (incluindo case-sensitive)
    console.log("\n📋 Listando TODAS as tabelas do schema public...");
    const publicTablesQuery = `
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_type = 'BASE TABLE' AND table_schema = 'public'
      ORDER BY table_name;
    `;

    // Também listar usando pg_tables para ver nomes exatos
    const pgTablesQuery = `
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    const publicTablesResult = await client.query(publicTablesQuery);

    if (publicTablesResult.rows.length === 0) {
      console.log(
        "📭 Nenhuma tabela encontrada no schema public (information_schema)."
      );
    } else {
      console.log(
        `🗂️  Encontradas ${publicTablesResult.rows.length} tabela(s) no schema public (information_schema):`
      );
      publicTablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    }

    // Verificar com pg_tables também
    console.log("\n📋 Listando tabelas usando pg_tables...");
    const pgTablesResult = await client.query(pgTablesQuery);

    if (pgTablesResult.rows.length === 0) {
      console.log("📭 Nenhuma tabela encontrada no schema public (pg_tables).");
    } else {
      console.log(
        `🗂️  Encontradas ${pgTablesResult.rows.length} tabela(s) no schema public (pg_tables):`
      );
      pgTablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.tablename}`);
      });
    }

    // Testar diretamente o comando que funciona no pgAdmin
    console.log(
      '\n🧪 Testando diretamente: SELECT * FROM public."ChecklistBasell"...'
    );
    try {
      const directTestQuery =
        'SELECT * FROM public."ChecklistBasell" ORDER BY id ASC LIMIT 3';
      const directTestResult = await client.query(directTestQuery);

      console.log(
        '✅ SUCESSO! A tabela "ChecklistBasell" existe e foi acessada!'
      );
      console.log(
        `📊 Encontrados ${directTestResult.rows.length} registro(s):`
      );

      if (directTestResult.rows.length > 0) {
        directTestResult.rows.forEach((row, index) => {
          console.log(`   ${index + 1}. ID: ${row.id}`);
          console.log(`      Dados:`, JSON.stringify(row, null, 6));
        });
      } else {
        console.log("📭 Tabela existe mas está vazia.");
      }
    } catch (directError) {
      console.log('❌ Erro ao acessar diretamente a tabela "ChecklistBasell":');
      console.log("📝 Erro:", directError.message);
      console.log("🔍 Código:", directError.code);
    }

    // Verificar especificamente a tabela ChecklistBasell (com aspas duplas)
    console.log(
      '\n🔍 Verificando tabela "ChecklistBasell" (com aspas duplas)...'
    );
    const checklistQuery = `
       SELECT table_schema, table_name
       FROM information_schema.tables 
       WHERE table_name = 'ChecklistBasell'
       ORDER BY table_schema, table_name;
     `;

    // Também verificar tabelas que podem ter nomes diferentes
    console.log("\n🔍 Buscando tabelas relacionadas a checklist...");
    const relatedTablesQuery = `
       SELECT table_schema, table_name
       FROM information_schema.tables 
       WHERE table_type = 'BASE TABLE' 
       AND (table_name ILIKE '%checklist%' OR table_name ILIKE '%basell%' OR table_name ILIKE '%check%')
       ORDER BY table_schema, table_name;
     `;

    const relatedTablesResult = await client.query(relatedTablesQuery);

    if (relatedTablesResult.rows.length > 0) {
      console.log("✅ Tabelas relacionadas encontradas:");
      relatedTablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_schema}.${row.table_name}`);
      });
    } else {
      console.log("❌ Nenhuma tabela relacionada a checklist encontrada.");
    }

    const checklistResult = await client.query(checklistQuery);

    if (checklistResult.rows.length === 0) {
      console.log("❌ Tabela ChecklistBasell não encontrada.");
    } else {
      console.log("✅ Tabela ChecklistBasell encontrada!");
      checklistResult.rows.forEach((row) => {
        console.log(
          `   📍 Schema: ${row.table_schema}, Tabela: ${row.table_name}`
        );
      });

      // Mostrar detalhes das colunas da tabela ChecklistBasell
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name ILIKE '%checklistbasell%'
        ORDER BY ordinal_position;
      `;

      const columnsResult = await client.query(columnsQuery);

      if (columnsResult.rows.length > 0) {
        console.log("\n📊 Estrutura da tabela ChecklistBasell:");
        columnsResult.rows.forEach((col, index) => {
          console.log(
            `   ${index + 1}. ${col.column_name} (${
              col.data_type
            }) - Nullable: ${col.is_nullable} - Default: ${
              col.column_default || "N/A"
            }`
          );
        });
      }

      // Testar o comando SELECT que funciona no pgAdmin
      console.log(
        '\n🧪 Testando comando SELECT da tabela "ChecklistBasell"...'
      );
      try {
        const selectQuery =
          'SELECT * FROM public."ChecklistBasell" ORDER BY id ASC LIMIT 5';
        const selectResult = await client.query(selectQuery);

        if (selectResult.rows.length > 0) {
          console.log(
            `✅ Encontrados ${selectResult.rows.length} registro(s) na tabela:`
          );
          selectResult.rows.forEach((row, index) => {
            console.log(
              `   ${index + 1}. ID: ${row.id}, Dados:`,
              JSON.stringify(row, null, 2)
            );
          });
        } else {
          console.log('📭 Tabela "ChecklistBasell" existe mas está vazia.');
        }
      } catch (selectError) {
        console.log('❌ Erro ao executar SELECT na tabela "ChecklistBasell":');
        console.log("📝 Erro:", selectError.message);
      }
    }
  } catch (error) {
    console.error("❌ Erro ao conectar com PostgreSQL:");
    console.error("📝 Detalhes do erro:", error.message);
    console.error("🔍 Código do erro:", error.code);
  } finally {
    // Fechar conexão
    await client.end();
    console.log("\n🔌 Conexão fechada.");
  }
}

// Executar teste
testConnection();
