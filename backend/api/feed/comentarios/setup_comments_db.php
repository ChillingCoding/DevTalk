<?php
include_once __DIR__ . '/../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    die("Falha na ligação à base de dados.\n");
}

try {
    $sql = "
    CREATE TABLE IF NOT EXISTS post_comments (
        id_comment SERIAL PRIMARY KEY,
        id_post INTEGER NOT NULL,
        email VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_comment_post FOREIGN KEY (id_post) REFERENCES feed (id_post) ON DELETE CASCADE
    );
    ";
    
    $db->exec($sql);
    echo "Tabela 'post_comments' criada com sucesso!\n";
} catch (PDOException $e) {
    echo "Erro ao criar tabela: " . $e->getMessage() . "\n";
}
