-- =============================================================
-- PROJETO: AppSocial (DevTalk) - Full Database Setup
-- Este script cria todas as tabelas necessárias para o projeto.
-- =============================================================

-- 1. Tabela de Utilizadores
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    bio TEXT DEFAULT 'Novo membro da appSocial.',
    avatar TEXT DEFAULT '/default-avatar.svg',
    coverimage TEXT DEFAULT 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Feed (Posts)
CREATE TABLE IF NOT EXISTS feed (
    id_post SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    image_url TEXT DEFAULT NULL,
    data_publicacao TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Comentários
CREATE TABLE IF NOT EXISTS post_comments (
    id_comment SERIAL PRIMARY KEY,
    id_post INTEGER NOT NULL REFERENCES feed(id_post) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Likes
CREATE TABLE IF NOT EXISTS post_likes (
    id_post INTEGER NOT NULL REFERENCES feed(id_post) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id_post, email)
);

-- Índices Recomendados
CREATE INDEX IF NOT EXISTS idx_feed_email ON feed(email);
CREATE INDEX IF NOT EXISTS idx_feed_data ON feed(data_publicacao DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON post_comments(id_post);
CREATE INDEX IF NOT EXISTS idx_likes_post ON post_likes(id_post);