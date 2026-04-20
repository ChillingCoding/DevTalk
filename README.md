# 🚀 DevTalk - Rede Social (Projeto Handover)

Este projeto é uma rede social funcional com sistema de autenticação, feed de posts com imagens e emojis, e sistema de comentários.

## 🛠️ Requisitos
- **Backend**: PHP 8.0+ e PostgreSQL 13+
- **Frontend**: Node.js 16+ e NPM

## 🏗️ Configuração do Backend (PHP/PostgreSQL)

1. **Base de Dados**:
   - Cria uma base de dados no PostgreSQL chamada `Backend` (ou o nome que preferires).
   - Executa o script de configuração total localizado em: `backend/docs/full_setup.sql`.
   - *Dica*: Podes usar o comando `psql -U teu_usuario -d Backend -f backend/docs/full_setup.sql`.

2. **Ligação (PHP)**:
   - Edita o ficheiro `backend/config/database.php` e insere as tuas credenciais do PostgreSQL (host, porta, utilizador, password).

3. **Pastas de Media**:
   - Certifica-te de que a pasta `backend/uploads/media` existe e tem permissões de escrita para o servidor PHP.

4. **Servidor**:
   - Inicia o servidor PHP a apontar para a pasta `backend/`:
     ```bash
     php -S 127.0.0.1:8000
     ```

## 💻 Configuração do Frontend (React + Vite)

1. **Instalação**:
   - Navega para a pasta `frontend/` e instala as dependências:
     ```bash
     npm install
     ```

2. **Ambiente**:
   - Se o teu backend não estiver a correr em `http://127.0.0.1:8000`, cria um ficheiro `.env` na raiz da pasta `frontend/` com:
     ```env
     VITE_API_BASE_URL=http://teu-endereco-backend
     ```

3. **Execução**:
   - Inicia o modo de desenvolvimento:
     ```bash
     npm run dev
     ```
   - O site estará disponível, por defeito, em `http://localhost:5173`.

## 📝 Notas de Versão
- O sistema de **Username (@handle)** foi removido para simplificar a experiência, usando agora apenas o **Nome Real** para identificação em posts e comentários.
- Suporte para **upload de fotos** em posts principais e **emojis** tanto em posts como em comentários.
