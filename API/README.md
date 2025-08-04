# 🚀 Servidor Express - Sistema de Checklist

## 📋 Descrição

Servidor Express para conectar o sistema de checklist ao banco de dados PostgreSQL via Sequelize ORM.

## 🔧 Instalação e Configuração

### Pré-requisitos

- Node.js v22.16.0 ou superior
- NPM instalado
- PostgreSQL instalado e rodando
- Banco de dados `checklist_db` criado

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Copie o arquivo .env.example para .env e configure:
cp .env.example .env

# Iniciar o servidor
npm run server
# ou
npm run api
# ou
npm run dev
```

### Configuração do Banco de Dados

Configure as variáveis de ambiente no arquivo `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=checklist_db
DB_USER=postgres
DB_PASSWORD=sua_senha
NODE_ENV=development
PORT=5000
```

## 🌐 Endpoints da API

### Base URL

```
http://localhost:5000/api
```

### Health Check

```http
GET /api/health
```

Retorna o status do servidor e conexão com o banco.

### Checklist Endpoints

#### 1. Listar todos os checklists

```http
GET /api/checklist
```

#### 2. Buscar checklist por ID

```http
GET /api/checklist/:id
```

#### 3. Criar novo checklist

```http
POST /api/checklist
Content-Type: application/json

{
  "nomeMotorista": "João Silva",
  "placaVeiculo": "ABC-1234",
  "dataInspecao": "2024-01-15",
  "status": "nao_terminou",
  "item1": "Conforme",
  "item1_observacao": "Observação do item 1",
  "item2": "Não conforme",
  "item2_observacao": "Observação do item 2",
  // ... outros itens
}
```

#### 4. Atualizar checklist

```http
PUT /api/checklist/:id
Content-Type: application/json

{
  "status": "terminou",
  "item3": "Conforme",
  // ... campos a atualizar
}
```

#### 5. Deletar checklist

```http
DELETE /api/checklist/:id
```

### Upload de Arquivos

#### Upload de mídia para itens

```http
POST /api/checklist
PUT /api/checklist/:id
Content-Type: multipart/form-data

FormData:
- midias: arquivos de imagem ou vídeo (sem limite de tamanho)
- outros campos do checklist
```

## 📁 Estrutura de Arquivos

```
API/
├── app.js              # Servidor principal
├── uploads/            # Arquivos de mídia
├── package.json        # Dependências e scripts
└── README.md          # Esta documentação
```

## 🗃️ Modelo de Dados

### ChecklistBasell

- `id`: Integer (Primary Key)
- `nomeMotorista`: String
- `placaVeiculo`: String
- `dataInspecao`: Date
- `status`: Enum ('nao_terminou', 'terminou')
- `item1` a `item9`: Enum ('Conforme', 'Não conforme', 'Não aplicável')
- `item1_observacao` a `item9_observacao`: Text
- `item10_midia` a `item14_midia`: String (caminhos dos arquivos)
- `item10_observacao` a `item14_observacao`: Text
- `createdAt`: DateTime
- `updatedAt`: DateTime

## 🔒 Validações

- Campos obrigatórios: `nomeMotorista`, `placaVeiculo`, `dataInspecao`
- Status deve ser 'nao_terminou' ou 'terminou'
- Itens devem ser 'Conforme', 'Não conforme' ou 'Não aplicável'
- **Upload sem limite de tamanho** para arquivos de mídia
- Tipos aceitos: imagens (jpg, jpeg, png, gif) e vídeos (mp4, avi, mov)

## 🚨 Tratamento de Erros

- **400**: Dados inválidos ou malformados
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

## 📊 Logs

O servidor registra:

- Conexão com banco de dados
- Sincronização de modelos
- Requisições HTTP
- Erros e exceções

## 🔧 Configurações

- **Porta**: 5000 (configurável via .env)
- **Banco**: PostgreSQL (checklist_db)
- **CORS**: Habilitado para todas as origens
- **Upload**: Pasta `uploads/`
- **Limite de arquivo**: Sem limite (configurável para banco local)
- **Pool de conexões**: Máx 5 conexões simultâneas

## 🚀 Próximos Passos

1. Conectar o frontend às rotas da API
2. Implementar autenticação (se necessário)
3. Adicionar testes automatizados
4. Configurar ambiente de produção

---

**Desenvolvido para o Sistema de Checklist Basell**
