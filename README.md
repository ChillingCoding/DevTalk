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
         │   ├── components
         │   ├── contexts
         │   ├── pages
         │   └── styles
         │  
         └──tests
   ```

   ## Como Iniciar o Projeto
   ### 1. Configurar o Frontend
   1. Vai para o diretório do frontend:
      ```bash
      cd frontend
      ````
   2. Instale e executa as dependencias:
      ```bash
      npm install
      npm run dev
      ```

   ### 2. Configurar o Backend 
   1. Introduza estes comandos
      ```bash
      cd backend
      cp .env.example .env
      ```

   2. Inicia o servidor
   ```bash
   php -S 127.0.0.1:8000
   ```

   ### 2. Configurar o Backend (PHP)

   1. Edite o ficheiro `backend/config/database.php` com as suas credenciais do PostgreSQL (host, porta, utilizador, password).
   2. Certifique-se de que a pasta `backend/uploads` tem permissoes de escrita.
   3. Inicie o servidor local do PHP a partir da raiz da pasta `backend/`:
      ```bash
      cd backend
      php -S 127.0.0.1:8000
      ```



   ## Testes
   ### Frontend
   Para correr os testes do frontend:
   ```bash
   cd frontend
   npm run test
   ```
   ### Backend
