const http = require("http");

// Função para fazer requisição HTTP
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

async function testAPI() {
  console.log("🧪 Testando API Checklist...");
  console.log("============================\n");

  try {
    // Teste 1: Health Check
    console.log("1️⃣ Testando Health Check...");
    const healthResponse = await makeRequest({
      hostname: "localhost",
      port: 5001,
      path: "/api/health",
      method: "GET",
    });
    console.log(`Status: ${healthResponse.status}`);
    console.log(`Resposta:`, healthResponse.data);
    console.log("");

    // Teste 2: Listar todos os checklists
    console.log("2️⃣ Testando GET /api/checklist...");
    const listResponse = await makeRequest({
      hostname: "localhost",
      port: 5001,
      path: "/api/checklist",
      method: "GET",
    });
    console.log(`Status: ${listResponse.status}`);
    console.log(`Resposta:`, listResponse.data);
    console.log("");

    // Teste 3: Criar novo checklist
    console.log("3️⃣ Testando POST /api/checklist...");
    const newChecklist = {
      nomeMotorista: "João Silva",
      placaVeiculo: "ABC-1234",
      dataInspecao: new Date().toISOString(),
      status: "nao_terminou",
      item1: "Conforme",
      item1_observacoes: "Teste de observação",
      item2: "Não conforme",
      item2_observacoes: "Precisa de reparo",
    };

    const createResponse = await makeRequest(
      {
        hostname: "localhost",
        port: 5001,
        path: "/api/checklist",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      JSON.stringify(newChecklist)
    );

    console.log(`Status: ${createResponse.status}`);
    console.log(`Resposta:`, createResponse.data);
    console.log("");

    console.log("✅ Testes concluídos!");
  } catch (error) {
    console.error("❌ Erro durante os testes:", error.message);
  }
}

testAPI();
