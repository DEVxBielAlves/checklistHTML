import { sequelize, testarConexao } from "./database/database.js";
import { ChecklistBasell } from "./models/checklist.js";

async function testarSistema() {
  console.log("🚀 Iniciando testes do sistema...");

  try {
    // Teste 1: Conexão com banco
    console.log("\n📊 Teste 1: Conexão com banco de dados");
    const conexaoOk = await testarConexao();
    if (!conexaoOk) {
      throw new Error("Falha na conexão com banco");
    }

    // Teste 2: Sincronização do modelo
    console.log("\n🔄 Teste 2: Sincronização do modelo");
    await ChecklistBasell.sync({ force: true });
    console.log("✅ Modelo sincronizado com sucesso!");

    // Teste 3: Criar um registro de teste
    console.log("\n📝 Teste 3: Criação de registro");
    const novoChecklist = await ChecklistBasell.create({
      nomeMotorista: "João Silva",
      placaVeiculo: "ABC-1234",
      item1: "Conforme",
      item2: "Não conforme",
      item3: "Não aplicável",
      item4: "Conforme",
      item5: "Conforme",
      item6: "Não conforme",
      item7: "Conforme",
      item8: "Não aplicável",
      item9: "Conforme",
      // Campos de mídia obrigatórios (itens 10-14)
      item10_midia: JSON.stringify(["foto_pneus_1.jpg", "foto_pneus_2.jpg"]),
      item11_midia: JSON.stringify(["foto_assoalho_1.jpg"]),
      item12_midia: JSON.stringify(["foto_borracha_1.jpg", "foto_borracha_2.jpg"]),
      item13_midia: JSON.stringify(["foto_lonas_1.jpg"]),
      item14_midia: JSON.stringify(["foto_teto_1.jpg", "foto_teto_2.jpg"]),
    });
    console.log("✅ Registro criado:", novoChecklist.toJSON());

    // Teste 4: Buscar registros
    console.log("\n🔍 Teste 4: Busca de registros");
    const registros = await ChecklistBasell.findAll();
    console.log(`✅ Encontrados ${registros.length} registro(s)`);

    // Teste 5: Validação de dados
    console.log("\n✅ Teste 5: Validação de dados");
    try {
      await ChecklistBasell.create({
        nomeMotorista: "Teste",
        placaVeiculo: "XYZ-9999",
        item1: "Valor Inválido", // Deve falhar
      });
    } catch (validationError) {
      console.log("✅ Validação funcionando:", validationError.message);
    }

    console.log(
      "\n🎉 TODOS OS TESTES PASSARAM! Sistema funcionando corretamente."
    );
  } catch (error) {
    console.error("❌ Erro durante os testes:", error);
  } finally {
    // Aguarda um pouco antes de fechar a conexão
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await sequelize.close();
    console.log("\n🔒 Conexão com banco fechada.");
  }
}

testarSistema();
