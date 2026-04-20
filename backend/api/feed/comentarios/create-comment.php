<?php


header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
else if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método não permitido.']);
    exit();
}
//Inclui o ficheiro database.php (onde faz a conecção com a base de dados)
include_once __DIR__ . '/../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Falha na ligação à base de dados.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'));

$postId  = isset($data->post_id) ? (int)$data->post_id : 0;
$email   = isset($data->email)   ? strtolower(trim((string)$data->email)) : '';
$content = isset($data->content) ? trim((string)$data->content) : '';

//Casos de erro
if ($postId <= 0) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Parâmetro post_id é obrigatório.']);
    exit();
}
else if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Email inválido ou em falta.']);
    exit();
}
else if ($content === '') {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'O conteúdo do comentário não pode estar vazio.']);
    exit();
}
else if (mb_strlen($content) > 1000) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'O comentário não pode ter mais de 1000 caracteres.']);
    exit();
}

try {
    //Verifica se o utilizador existe 
    $checkUser = $db->prepare('SELECT name, avatar FROM users WHERE email = :email');
    $checkUser->bindParam(':email', $email);
    $checkUser->execute();
    $user = $checkUser->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Utilizador não encontrado.']);
        exit();
    }

    //Verifica se o post original existe
    $checkPost = $db->prepare('SELECT id_post FROM feed WHERE id_post = :post_id');
    $checkPost->bindParam(':post_id', $postId);
    $checkPost->execute();
    
    if (!$checkPost->fetch()) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Post inexistente.']);
        exit();
    }

    //Insere o comentário na base de dados
    $insert = $db->prepare(
        'INSERT INTO post_comments (id_post, email, content) VALUES (:post_id, :email, :content)'
    );
    $insert->bindParam(':post_id', $postId);
    $insert->bindParam(':email',   $email);
    $insert->bindParam(':content', $content);
    $insert->execute();

    $newId = $db->lastInsertId();

    // 4. Buscar o comentário criado 
    $fetch = $db->prepare(
        'SELECT id_comment, email, content, created_at FROM post_comments WHERE id_comment = :id_comment'
    );
    $fetch->bindParam(':id_comment', $newId);
    $fetch->execute();
    $commentRow = $fetch->fetch(PDO::FETCH_ASSOC);

    

    
    
    $isHttps  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $protocol = $isHttps ? 'https' : 'http';
    $host     = $_SERVER['HTTP_HOST'] ?? '127.0.0.1:8000';
    $baseUrl  = $protocol . '://' . $host;

    $avatar = $user['avatar'] ?? '';
    if (!empty($avatar) && !preg_match('/^https?:\/\//i', $avatar)) {
        $avatar = $baseUrl . (str_starts_with($avatar, '/') ? $avatar : '/' . $avatar);
    }
    if (empty($avatar)) {
        $avatar = '/default-avatar.svg';
    }

    http_response_code(201);
    echo json_encode([
        'status'  => 'success',
        'message' => 'Comentário criado com sucesso!',
        'comment' => [
            'id' => (string)$commentRow['id_comment'],
            'email' => $commentRow['email'],
            'content' => $commentRow['content'],
            'created_at' => $commentRow['created_at'],
            'name' => $user['name'] ?: 'Membro',

            'avatar' => $avatar
        ],
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Erro ao submeter comentário.',
        'details' => $e->getMessage()
    ]);
}
