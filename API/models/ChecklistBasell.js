const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// Modelo para a tabela ChecklistBasell
const ChecklistBasell = sequelize.define(
  "ChecklistBasell",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nomeMotorista: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    placaVeiculo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dataInspecao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("nao_terminou", "terminou", "finalizado"),
      allowNull: false,
      defaultValue: "nao_terminou",
    },
    dataFinalizacao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Itens do checklist 1-9 (USER-DEFINED = ENUM)
    item1: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      defaultValue: "Não aplicável",
    },
    item1_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item2: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      defaultValue: "Não aplicável",
    },
    item2_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item3: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      defaultValue: "Não aplicável",
    },
    item3_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item4: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      defaultValue: "Não aplicável",
    },
    item4_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item5: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      defaultValue: "Não aplicável",
    },
    item5_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item6: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      defaultValue: "Não aplicável",
    },
    item6_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item7: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      defaultValue: "Não aplicável",
    },
    item7_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item8: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      defaultValue: "Não aplicável",
    },
    item8_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item9: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      defaultValue: "Não aplicável",
    },
    item9_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Itens 10-14 com mídia
    item10_midia: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    item10_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item11_midia: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    item11_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item12_midia: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    item12_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item13_midia: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    item13_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item14_midia: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    item14_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "ChecklistBasell",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = ChecklistBasell;
