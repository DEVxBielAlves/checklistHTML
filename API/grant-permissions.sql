-- Script para conceder permissões ao usuário checklist_user
-- Execute este script como superusuário (postgres)

-- Conceder permissões no esquema public
GRANT ALL PRIVILEGES ON SCHEMA public TO checklist_user;

-- Conceder permissões para criar objetos
GRANT CREATE ON SCHEMA public TO checklist_user;

-- Conceder permissões no banco de dados
GRANT ALL PRIVILEGES ON DATABASE checklist_db TO checklist_user;

-- Conceder permissões para usar o esquema
GRANT USAGE ON SCHEMA public TO checklist_user;

-- Conceder permissões para criar tipos
ALTER USER checklist_user CREATEDB;

-- Verificar permissões
\du checklist_user
\l checklist_db