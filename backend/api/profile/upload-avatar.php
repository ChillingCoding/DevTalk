<?php
/**
 * API para Upload de Avatar
 * Localização: /api/profile/upload-avatar.php
 */

// 1. Headers para REST API e CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Resposta para Preflight (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Bloqueia qualquer método que não seja POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Método não permitido. Use POST.'
    ]);
    exit();
}

// 2. Conexão à Base de Dados
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Falha na ligação à base de dados.'
    ]);
    exit();
}

// 3. Validação de Inputs
$userId = isset($_POST['user_id']) ? (int) $_POST['user_id'] : 0;

if ($userId <= 0) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'user_id inválido.']);
    exit();
}

if (!isset($_FILES['avatar'])) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Ficheiro não enviado.']);
    exit();
}

$file = $_FILES['avatar'];

// 4. Validações do Ficheiro
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Erro no upload.']);
    exit();
}

// Limite de 5MB
if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'O ficheiro é muito grande (Máx 5MB).']);
    exit();
}

// Verificar MIME Type real
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowedTypes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp'
];

if (!isset($allowedTypes[$mimeType])) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Apenas JPG, PNG ou WEBP são permitidos.']);
    exit();
}

try {
    // 5. Verificar se o utilizador existe e buscar avatar antigo
    $stmt = $db->prepare('SELECT avatar FROM users WHERE id = :id');
    $stmt->bindParam(':id', $userId);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Utilizador não encontrado.']);
        exit();
    }

    // 6. Configurar Pastas
    $baseUploadPath = __DIR__ . '/../../uploads/avatars';
    if (!is_dir($baseUploadPath)) {
        mkdir($baseUploadPath, 0777, true);
    }

    // Gerar nome único para evitar cache do navegador e conflitos
    $extension = $allowedTypes[$mimeType];
    $newFileName = sprintf('user_%d_%s.%s', $userId, bin2hex(random_bytes(8)), $extension);
    $destination = $baseUploadPath . '/' . $newFileName;

    // 7. Mover Ficheiro e Atualizar DB
    if (move_uploaded_file($file['tmp_name'], $destination)) {
        
        $avatarPath = '/uploads/avatars/' . $newFileName;

        // Atualiza a coluna 'avatar' (que você já criou manualmente no SQL)
        $update = $db->prepare('UPDATE users SET avatar = :avatar WHERE id = :id');
        $update->bindParam(':avatar', $avatarPath);
        $update->bindParam(':id', $userId);
        $update->execute();

        // (Opcional) Apagar a foto antiga do servidor para não acumular lixo
        if (!empty($user['avatar'])) {
            $oldFile = __DIR__ . '/../../' . ltrim($user['avatar'], '/');
            if (file_exists($oldFile) && is_file($oldFile)) {
                unlink($oldFile);
            }
        }

        // 8. Retornar URLs
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
        $protocol = $isHttps ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? '127.0.0.1:8000';

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Foto atualizada!',
            'avatar_path' => $avatarPath,
            'avatar_url' => $protocol . '://' . $host . $avatarPath
        ]);
    } else {
        throw new Exception('Falha ao mover o ficheiro.');
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro interno no servidor.',
        'details' => $e->getMessage()
    ]);
}