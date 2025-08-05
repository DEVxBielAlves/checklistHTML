const { Client } = require("pg");
require("dotenv").config({ path: "../.env" });

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkEnums() {
  try {
    await client.connect();
    console.log("✅ Conectado ao PostgreSQL");

    // Verificar tipos ENUM existentes
    const enumsResult = await client.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname LIKE '%ChecklistBasell%'
      ORDER BY t.typname, e.enumsortorder;
    `);

    console.log("\n📋 Tipos ENUM existentes:");
    console.log("==========================");

    let currentType = "";
    enumsResult.rows.forEach((row) => {
      if (row.typname !== currentType) {
        console.log(`\n🔸 ${row.typname}:`);
        currentType = row.typname;
      }
      console.log(`  - ${row.enumlabel}`);
    });

    // Verificar dados existentes
    const dataResult = await client.query(
      'SELECT * FROM "ChecklistBasell" LIMIT 1'
    );
    console.log("\n📋 Dados existentes (primeiro registro):");
    console.log("=========================================");
    if (dataResult.rows.length > 0) {
      const row = dataResult.rows[0];
      console.log("Status:", row.status);
      console.log("Item1:", row.item1);
      console.log("Item2:", row.item2);
    } else {
      console.log("Nenhum registro encontrado.");
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  } finally {
    await client.end();
  }
}

checkEnums();
