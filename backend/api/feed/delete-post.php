<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método não permitido. Use DELETE.']);
    exit();
}

include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Falha na ligação à base de dados.',
        'details' => $database->getLastError()
    ]);
    exit();
}

$data   = json_decode(file_get_contents('php://input'));
$postId = isset($data->post_id) ? (int)$data->post_id : 0;
$email  = isset($data->email) ? strtolower(trim((string)$data->email)) : '';

if ($postId <= 0 || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'post_id e email válidos são obrigatórios.']);
    exit();
}

try {
    //Verificar se o post existe e se pertence ao utilizador
    $check = $db->prepare('SELECT id_post, email FROM feed WHERE id_post = :post_id');
    $check->bindParam(':post_id', $postId);
    $check->execute();
    $post = $check->fetch(PDO::FETCH_ASSOC);

    if (!$post) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Post não encontrado.']);
        exit();
    }

    if ($post['email'] !== $email) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Não tens permissão para apagar este post.']);
        exit();
    }

    $delete = $db->prepare('DELETE FROM feed WHERE id_post = :post_id');
    $delete->bindParam(':post_id', $postId);
    $delete->execute();

    http_response_code(200);
    echo json_encode([
        'status'  => 'success',
        'message' => 'Post apagado com sucesso.',
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Erro ao apagar post.',
        'details' => $e->getMessage()
    ]);
}
