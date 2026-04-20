# DevTalk - Rede Social

Este projeto e uma rede social funcional com sistema de autenticacao, feed de posts e perfil de utilizador.

## Stack Tecnologica

### Frontend
- React 19 (com Vite)
- TypeScript
- Tailwind CSS (Estilizacao)
- Lucide React (Icones)
- Radix UI (Componentes acessiveis)
- Axios (Comunicacao API)
- Vitest (Testes unitários)

### Backend
- PHP 8.0+
- PostgreSQL (Base de dados)
- PDO (Camada de abstracao de dados)

## Como Iniciar o Projeto

### 1. Configuracao da Base de Dados (PostgreSQL)

1. Crie uma base de dados chamada `Backend` no seu servidor PostgreSQL.
2. Execute o script SQL inicial:
   ```bash
   psql -U seu_utilizador -d Backend -f backend/docs/full_setup.sql
   ```
3. Execute o script de configuracao de likes para criar a tabela necessaria:
   ```bash
   php backend/api/feed/setup_likes.php
   ```

### 2. Configurar o Backend (PHP)

1. Edite o ficheiro `backend/config/database.php` com as suas credenciais do PostgreSQL (host, porta, utilizador, password).
2. Certifique-se de que a pasta `backend/uploads` tem permissoes de escrita.
3. Inicie o servidor local do PHP a partir da raiz da pasta `backend/`:
   ```bash
   cd backend
   php -S 127.0.0.1:8000
   ```

### 3. Configurar o Frontend (React)

1. Navegue para a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependencias:
   ```bash
   npm install
   ```
3. (Opcional) Crie um ficheiro `.env` se o backend nao estiver em `http://127.0.0.1:8000`:
   ```env
   VITE_API_BASE_URL=http://seu-endereco-backend
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

O frontend estara acessivel em `http://localhost:5173`.

## Testes

### Frontend
Para correr os testes do frontend:
```bash
cd frontend
npm run test
```
