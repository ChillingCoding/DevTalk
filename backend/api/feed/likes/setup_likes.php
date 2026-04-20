<?php
/**
 * Script para criar a tabela de likes.
 */
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    die("Falha na ligação à base de dados.\n");
}

try {
    $sql = "
    CREATE TABLE IF NOT EXISTS post_likes (
        id_post INTEGER NOT NULL REFERENCES feed(id_post) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (id_post, email)
    );
    ";
    
    $db->exec($sql);
    echo "Tabela 'post_likes' criada com sucesso!\n";
} catch (PDOException $e) {
    echo "Erro ao criar tabela: " . $e->getMessage() . "\n";
}
