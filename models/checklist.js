import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

const ChecklistBasell = sequelize.define(
  "Checklist",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
      defaultValue: DataTypes.NOW,
    },
    // Itens 1-9: Verificações Básicas com Observações
    item1: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["Conforme", "Não conforme", "Não aplicável"]],
          msg: "Item 1 deve ser Conforme, Não conforme ou Não aplicável"
        }
      },
    },
    item1_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Item 1 - Luzes e Sinalização"
    },
    item2: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["Conforme", "Não conforme", "Não aplicável"]],
          msg: "Item 2 deve ser Conforme, Não conforme ou Não aplicável"
        }
      },
    },
    item2_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Item 2 - Freios e Sistema de Frenagem"
    },
    item3: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["Conforme", "Não conforme", "Não aplicável"]],
          msg: "Item 3 deve ser Conforme, Não conforme ou Não aplicável"
        }
      },
    },
    item3_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Item 3 - Direção e Suspensão"
    },
    item4: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["Conforme", "Não conforme", "Não aplicável"]],
          msg: "Item 4 deve ser Conforme, Não conforme ou Não aplicável"
        }
      },
    },
    item4_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Item 4 - Motor e Transmissão"
    },
    item5: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["Conforme", "Não conforme", "Não aplicável"]],
          msg: "Item 5 deve ser Conforme, Não conforme ou Não aplicável"
        }
      },
    },
    item5_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Item 5 - Equipamentos de Segurança"
    },
    item6: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["Conforme", "Não conforme", "Não aplicável"]],
          msg: "Item 6 deve ser Conforme, Não conforme ou Não aplicável"
        }
      },
    },
    item6_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Item 6 - Documentação e Licenças"
    },
    item7: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["Conforme", "Não conforme", "Não aplicável"]],
          msg: "Item 7 deve ser Conforme, Não conforme ou Não aplicável"
        }
      },
    },
    item7_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Item 7 - Limpeza e Organização"
    },
    item8: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["Conforme", "Não conforme", "Não aplicável"]],
          msg: "Item 8 deve ser Conforme, Não conforme ou Não aplicável"
        }
      },
    },
    item8_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Item 8 - Combustível e Fluidos"
    },
    item9: {
      type: DataTypes.ENUM("Conforme", "Não conforme", "Não aplicável"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["Conforme", "Não conforme", "Não aplicável"]],
          msg: "Item 9 deve ser Conforme, Não conforme ou Não aplicável"
        }
      },
    },
    item9_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Item 9 - Condições Gerais do Veículo"
    },
    // Itens 10-14: Inspeções Visuais com Mídia (já configurados)
    item10_midia: {
      type: DataTypes.TEXT, // Para armazenar múltiplos caminhos de arquivo (JSON)
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Item 10 - Inspeção dos Pneus: Mídia é obrigatória"
        }
      },
      comment: "Caminhos das mídias (fotos/vídeos) para Inspeção dos Pneus"
    },
    item10_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Inspeção dos Pneus"
    },
    item11_midia: {
      type: DataTypes.TEXT, // Para armazenar múltiplos caminhos de arquivo (JSON)
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Item 11 - Inspeção do Assoalho: Mídia é obrigatória"
        }
      },
      comment: "Caminhos das mídias (fotos/vídeos) para Inspeção do Assoalho"
    },
    item11_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Inspeção do Assoalho"
    },
    item12_midia: {
      type: DataTypes.TEXT, // Para armazenar múltiplos caminhos de arquivo (JSON)
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Item 12 - Proteções de Borracha: Mídia é obrigatória"
        }
      },
      comment: "Caminhos das mídias (fotos/vídeos) para Proteções de Borracha"
    },
    item12_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Proteções de Borracha"
    },
    item13_midia: {
      type: DataTypes.TEXT, // Para armazenar múltiplos caminhos de arquivo (JSON)
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Item 13 - Inspeção das Lonas: Mídia é obrigatória"
        }
      },
      comment: "Caminhos das mídias (fotos/vídeos) para Inspeção das Lonas"
    },
    item13_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Inspeção das Lonas"
    },
    item14_midia: {
      type: DataTypes.TEXT, // Para armazenar múltiplos caminhos de arquivo (JSON)
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Item 14 - Inspeção do Teto: Mídia é obrigatória"
        }
      },
      comment: "Caminhos das mídias (fotos/vídeos) para Inspeção do Teto"
    },
    item14_observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações para Inspeção do Teto"
    },
  },
  {
    tableName: "ChecklistBasell",
    timestamps: true,
  }
);

export { ChecklistBasell };
