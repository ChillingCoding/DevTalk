# DevTalk - Rede Social

Este projeto é uma rede social funcional, que conta com um sistema de autenticação, um feed de publicações e perfis de utilizador personalizados. No fundo, é uma plataforma completa onde podes partilhar o que quiseres, interagir com outros utilizadores e gerir a tua presença online de forma simples e segura.

## Stack 

### Frontend
- React 19 (com Vite)
- TypeScript
- Tailwind CSS (Estilização)
- Lucide React (Icones)
- Radix UI (Componentes acessiveis)
- Axios (Comunicação API)
- Vitest (Testes unitários)

### Backend
- PHP 8.0+
- PostgreSQL (Base de dados)
- RestAPI


## Estrutura
```bash
.
├── backend
│   ├── api
│   │     ├── auth
│   │     ├── feed
│   │     │     ├── comentarios
│   │     │     └── likes
│   │     └── profile
│   ├── config
│   ├── docs
│   ├── tests
│   ├── uploads
│   │    ├── avatars
│   │    └── media
│   └── openapi.yaml
└── frontend
      ├──src 
   │  ├── components
   │  ├── contexts
   │  ├── pages
   │  └── styles
   │  
   └──tests
```

## Como Iniciar o Projeto
### 1. Configuração da Base de Dados (PostgreSQL)

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
3. Inicie o servidor de desenvolvimento:
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
### Backend
