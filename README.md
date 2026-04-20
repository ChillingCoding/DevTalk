# DevTalk - Rede Social

Este projeto é uma rede social funcional que conta com um sistema de autenticação, um feed de publicações e perfis de utilizador personalizados. No fundo, é uma plataforma completa onde podes partilhar o que quiseres, interagir com outros utilizadores e gerir a tua presença online de forma simples e segura.

## Tecnologias 

### Frontend
- React + Vite
- TypeScript
- Tailwind CSS

### Backend
- PHP 
- PostgreSQL
- API REST

### DevOps
- Docker

## Estrutura
```bash
.
├── backend
│   ├── api
│   │   ├── auth
│   │   ├── feed
│   │   │   ├── comentarios
│   │   │   └── likes
│   │   └── profile
│   ├── config
│   ├── docs
│   ├── tests
│   ├── uploads
│   │   ├── avatars
│   │   └── media
│   └── openapi.yaml
├── frontend
│   ├── src 
│   │   ├── components
│   │   ├── contexts
│   │   ├── pages
│   │   └── styles
│   └── tests
└── docker-compose.yml
```

## Como Iniciar o Projeto

1. Abre o terminal e executa o comando na pasta raiz do projeto: 
```bash
docker-compose up -d --build
```

2. Abre o teu navegador e acede a: [http://localhost:80](http://localhost:80)

---

### Como Parar o Projeto

Para desligar todos os serviços e encerrar a plataforma em segurança, executa o seguinte comando no terminal:
```bash
docker-compose down
```

---

## Documentação da API

Este projeto conta com um ficheiro `openapi.yaml` que contém o mapeamento completo das rotas do Backend. 
Ao iniciares o Docker (`docker-compose up -d`), o serviço do **Swagger UI** é gerido e arrancado de forma automática.
- Podes verificar a documentação interativa da API acedendo a: [http://localhost:8080](http://localhost:8080)

---

## Testes

### Frontend
Para correr os testes do Frontend:
```bash
cd frontend
npm run test
```

### Backend
Para correr os testes de lógica do Backend:
```bash
cd backend
php tests/UserLogicTest.php
```