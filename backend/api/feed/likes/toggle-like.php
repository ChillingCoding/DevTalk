<?php


/**
 * Configuração de Cabeçalhos e Segurança: Define as regras de CORS e métodos permitidos.
 */
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método não permitido.']);
    exit();
}

include_once __DIR__ . '/../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Falha na ligação à base de dados.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'));

try {
   
    
    //Garante que a tabela de likes existe antes de qualquer operação.
    $db->exec("
        CREATE TABLE IF NOT EXISTS post_likes (
            id_post INTEGER NOT NULL REFERENCES feed(id_post) ON DELETE CASCADE,
            email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (id_post, email)
        );
    ");

    $postId = isset($data->post_id) ? (int)$data->post_id : 0;
    $email  = isset($data->email)   ? strtolower(trim((string)$data->email)) : '';

    if ($postId <= 0 || $email === '') {
        http_response_code(422);
        echo json_encode(['status' => 'error', 'message' => 'post_id e email são obrigatórios.']);
        exit();
    }

    //Verificar se o like já existe
    $check = $db->prepare('SELECT 1 FROM post_likes WHERE id_post = :post_id AND email = :email');
    $check->bindParam(':post_id', $postId);
    $check->bindParam(':email',   $email);
    $check->execute();
    $isLiked = (bool)$check->fetch();
    
   
    if ($isLiked) {
        //Remover Like 
        $stmt = $db->prepare('DELETE FROM post_likes WHERE id_post = :post_id AND email = :email');
    } else {
        //Adicionar Like
        $stmt = $db->prepare('INSERT INTO post_likes (id_post, email) VALUES (:post_id, :email)');
    }
    
    $stmt->bindParam(':post_id', $postId);
    $stmt->bindParam(':email',   $email);
    $stmt->execute();
    
    //Contar o novo total de likes do post
    $countStmt = $db->prepare('SELECT COUNT(*) as total FROM post_likes WHERE id_post = :post_id');
    $countStmt->bindParam(':post_id', $postId);
    $countStmt->execute();
    $countRow = $countStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'isLiked' => !$isLiked,
        'likes' => (int)$countRow['total']
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Erro ao processar like.',
        'details' => $e->getMessage()
    ]);
}

