   # DevTalk - Rede Social

   Este projeto é uma rede social funcional, que conta com um sistema de autenticação, um feed de publicações e perfis de utilizador personalizados. No fundo, é uma plataforma completa onde podes partilhar o que quiseres, interagir com outros utilizadores e gerir a tua presença online de forma simples e segura.

   ## Stack 

   ### Frontend
   - React + Vite
   - TypeScript
   - Tailwind CSS
   
   ### Backend
   - PHP 
   - PostgreSQL
   - RestAPI

   ### DevOps
   - Docker


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
   ├── frontend
   │     ├──src 
   │     │   ├── components
   │     │   ├── contexts
   │     │   ├── pages
   │     │   └── styles
   │     │  
   │     └──tests
   └── docker-compose.yml
   ```

   ## Como Iniciar o Projeto
   1. Abra o terminal e execute o comando na pasta do projeto: 
   ```bash
      docker-compose up -d --build
   ```
   2. Abra o navegador e acesse: http://localhost:80
   ## Testes
   ### Frontend
   Para correr os testes do frontend:
   ```bash
   cd frontend
   npm run test
   ```
   ### Backend
   Para correr os testes da lógica do backend:
   ```bash
   cd backend
   php tests/UserLogicTest.php
   ```