const express = require("express");
const router = express.Router();
const ChecklistBasell = require("../models/ChecklistBasell");

// GET - Buscar todos os checklists
router.get("/", async (req, res) => {
  try {
    const checklists = await ChecklistBasell.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json({
      success: true,
      data: checklists,
      count: checklists.length,
    });
  } catch (error) {
    console.error("Erro ao buscar checklists:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// GET - Buscar checklist por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const checklist = await ChecklistBasell.findByPk(id);

    if (!checklist) {
      return res.status(404).json({
        success: false,
        message: "Checklist não encontrado",
      });
    }

    res.json({
      success: true,
      data: checklist,
    });
  } catch (error) {
    console.error("Erro ao buscar checklist:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// POST - Criar novo checklist
router.post("/", async (req, res) => {
  try {
    const checklistData = req.body;

    // Validação básica
    if (!checklistData.nomeMotorista || !checklistData.placaVeiculo) {
      return res.status(400).json({
        success: false,
        message: "Nome do motorista e placa do veículo são obrigatórios",
      });
    }

    const novoChecklist = await ChecklistBasell.create(checklistData);

    res.status(201).json({
      success: true,
      message: "Checklist criado com sucesso",
      data: novoChecklist,
    });
  } catch (error) {
    console.error("Erro ao criar checklist:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// PUT - Atualizar checklist existente
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const checklist = await ChecklistBasell.findByPk(id);

    if (!checklist) {
      return res.status(404).json({
        success: false,
        message: "Checklist não encontrado",
      });
    }

    await checklist.update(updateData);

    res.json({
      success: true,
      message: "Checklist atualizado com sucesso",
      data: checklist,
    });
  } catch (error) {
    console.error("Erro ao atualizar checklist:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// DELETE - Deletar checklist
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const checklist = await ChecklistBasell.findByPk(id);

    if (!checklist) {
      return res.status(404).json({
        success: false,
        message: "Checklist não encontrado",
      });
    }

    await checklist.destroy();

    res.json({
      success: true,
      message: "Checklist deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar checklist:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// GET - Buscar checklists por motorista
router.get("/motorista/:nome", async (req, res) => {
  try {
    const { nome } = req.params;
    const checklists = await ChecklistBasell.findAll({
      where: {
        nomeMotorista: {
          [require("sequelize").Op.iLike]: `%${nome}%`,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: checklists,
      count: checklists.length,
    });
  } catch (error) {
    console.error("Erro ao buscar checklists por motorista:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// GET - Buscar checklists por placa
router.get("/veiculo/:placa", async (req, res) => {
  try {
    const { placa } = req.params;
    const checklists = await ChecklistBasell.findAll({
      where: {
        placaVeiculo: {
          [require("sequelize").Op.iLike]: `%${placa}%`,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: checklists,
      count: checklists.length,
    });
  } catch (error) {
    console.error("Erro ao buscar checklists por placa:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// POST - Salvar informações básicas do checklist
router.post("/basic-info", async (req, res) => {
  try {
    const basicInfoData = req.body;

    // Validação básica
    if (!basicInfoData.nomeMotorista || !basicInfoData.placaVeiculo) {
      return res.status(400).json({
        success: false,
        message: "Nome do motorista e placa do veículo são obrigatórios",
      });
    }

    const novoChecklist = await ChecklistBasell.create(basicInfoData);

    res.status(201).json({
      success: true,
      message: "Informações básicas salvas com sucesso!",
      data: novoChecklist,
    });
  } catch (error) {
    console.error("Erro ao salvar informações básicas:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// PUT - Atualizar status do checklist
router.put("/status", async (req, res) => {
  try {
    const { checklistId, status, dataFinalizacao } = req.body;

    // Validação básica
    if (!checklistId || !status) {
      return res.status(400).json({
        success: false,
        message: "ID do checklist e status são obrigatórios",
      });
    }

    const checklist = await ChecklistBasell.findByPk(checklistId);

    if (!checklist) {
      return res.status(404).json({
        success: false,
        message: "Checklist não encontrado",
      });
    }

    // Atualizar status e data de finalização
    const updateData = { status };
    if (dataFinalizacao) {
      updateData.dataFinalizacao = dataFinalizacao;
    }

    await checklist.update(updateData);

    res.json({
      success: true,
      message: "Status do checklist atualizado com sucesso",
      data: {
        id: checklist.id,
        status: checklist.status,
        dataFinalizacao: checklist.dataFinalizacao
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar status do checklist:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

module.exports = router;
