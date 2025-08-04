/**
 * Script de teste para validar a API do checklist
 */

// Node.js 18+ tem fetch nativo

// Dados de teste
const testData = {
  nomeMotorista: "Gabriel Teste",
  placaVeiculo: "TST-1234",
  status: "nao_terminou",
  item1: "Conforme",
  item1_observacoes: "Teste item 1",
  item2: "Não conforme",
  item2_observacoes: "Teste item 2",
  item3: "Conforme",
  item3_observacoes: "",
  item4: "Conforme",
  item4_observacoes: "",
  item5: "Conforme",
  item5_observacoes: "",
  item6: "Não conforme",
  item6_observacoes: "Teste item 6",
  item7: "Não aplicável",
  item7_observacoes: "",
  item8: "Conforme",
  item8_observacoes: "",
  item9: "Não aplicável",
  item9_observacoes: "",
  item10_midia: JSON.stringify([]),
  item10_observacoes: "",
  item11_midia: JSON.stringify([]),
  item11_observacoes: "",
  item12_midia: JSON.stringify([]),
  item12_observacoes: "",
  item13_midia: JSON.stringify([]),
  item13_observacoes: "",
  item14_midia: JSON.stringify([]),
  item14_observacoes: "",
};

async function testAPI() {
  try {
    console.log("🧪 Testando API do Checklist...");

    // Teste 1: Health check
    console.log("\n1. Testando health check...");
    const healthResponse = await fetch("http://localhost:5001/api/health");
    const healthData = await healthResponse.json();
    console.log("✅ Health check:", healthData.message);

    // Teste 2: Criar checklist
    console.log("\n2. Testando criação de checklist...");
    const createResponse = await fetch("http://localhost:5001/api/checklist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Erro HTTP ${createResponse.status}: ${errorText}`);
    }

    const createData = await createResponse.json();
    console.log("✅ Checklist criado com sucesso!");
    console.log("📋 ID do checklist:", createData.checklist.id);
    console.log("👤 Motorista:", createData.checklist.nomeMotorista);
    console.log("🚗 Placa:", createData.checklist.placaVeiculo);

    // Teste 3: Listar checklists
    console.log("\n3. Testando listagem de checklists...");
    const listResponse = await fetch("http://localhost:5001/api/checklist");
    const listData = await listResponse.json();
    console.log(`✅ Total de checklists: ${listData.length}`);

    // Teste 4: Buscar checklist específico
    console.log("\n4. Testando busca por ID...");
    const getResponse = await fetch(
      `http://localhost:5001/api/checklist/${createData.checklist.id}`
    );
    const getData = await getResponse.json();
    console.log("✅ Checklist encontrado:", getData.nomeMotorista);

    console.log(
      "\n🎉 Todos os testes passaram! A API está funcionando corretamente."
    );
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
    process.exit(1);
  }
}

// Executar testes
testAPI();
