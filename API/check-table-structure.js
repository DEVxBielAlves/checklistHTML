const { Client } = require("pg");
require("dotenv").config({ path: "../.env" });

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkTableStructure() {
  try {
    await client.connect();
    console.log("✅ Conectado ao PostgreSQL");

    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'ChecklistBasell' 
      ORDER BY ordinal_position
    `);

    console.log("\n📋 Estrutura da tabela ChecklistBasell:");
    console.log("=====================================");
    result.rows.forEach((row) => {
      console.log(
        `${row.column_name.padEnd(25)} | ${row.data_type.padEnd(
          20
        )} | Nullable: ${row.is_nullable}`
      );
    });
    console.log("=====================================");
    console.log(`Total de colunas: ${result.rows.length}`);
  } catch (error) {
    console.error("❌ Erro:", error.message);
  } finally {
    await client.end();
  }
}

checkTableStructure();
