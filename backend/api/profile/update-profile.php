<?php
/**
 * POST /api/profile/update-profile.php
 * Atualiza o nome e bio do utilizador na base de dados.
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

include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Falha na ligação à base de dados.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'));

$email = isset($data->email) ? strtolower(trim((string)$data->email)) : '';
$name  = isset($data->name)  ? trim((string)$data->name)  : '';
$bio   = isset($data->bio)   ? trim((string)$data->bio)   : '';

if ($email === '' || $name === '') {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Email e Nome são obrigatórios.']);
    exit();
}

try {
    // 1. Verificar se o utilizador existe
    $check = $db->prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(:email)');
    $check->bindParam(':email', $email);
    $check->execute();
    if (!$check->fetch()) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Utilizador não encontrado com este email.']);
        exit();
    }

    // 2. Atualizar o nome e a bio
    $stmt = $db->prepare('UPDATE users SET name = :name, bio = :bio WHERE LOWER(email) = LOWER(:email)');
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':bio', $bio);
    $stmt->bindParam(':email', $email);
    
    $stmt->execute();
    
    // Devolvemos sempre sucesso se a query correu bem (mesmo que rows afetadas seja 0 por os dados serem iguais)
    echo json_encode(['status' => 'success', 'message' => 'Perfil atualizado com sucesso.']);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Erro ao atualizar perfil.',
        'details' => $e->getMessage()
    ]);
}
