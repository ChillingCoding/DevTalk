<?php


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

$email     = isset($data->email)     ? strtolower(trim((string)$data->email)) : '';
$descricao = isset($data->descricao) ? trim((string)$data->descricao)        : '';
$imageUrl  = isset($data->image_url) ? trim((string)$data->image_url)        : null;


if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Email inválido.']);
    exit();
}

if ($descricao === '') {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'A descrição não pode estar vazia.']);
    exit();
}

try {
    //Verificar se o utilizador existe (precisamos do nome e avatar para a resposta)
    $check = $db->prepare('SELECT name, avatar FROM users WHERE email = :email');
    $check->bindParam(':email', $email);
    $check->execute();
    $user = $check->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Utilizador não encontrado.']);
        exit();
    }

    //Inserir post usando os nomes de colunas CORRETOS: email e descricao
    $insert = $db->prepare(
        'INSERT INTO feed (email, descricao, image_url) VALUES (:email, :descricao, :image)'
    );
    $insert->bindParam(':email', $email);
    $insert->bindParam(':descricao', $descricao);
    $insert->bindParam(':image', $imageUrl);
    $insert->execute();

    // No PostgreSQL, para pegar o último ID de id_post:
    $newId = $db->lastInsertId();

    //Buscar o post criado (usando os nomes reais das suas colunas)
    $fetch = $db->prepare(
        'SELECT id_post, email, descricao, image_url, data_publicacao FROM feed WHERE id_post = :id'
    );
    $fetch->bindParam(':id', $newId);
    $fetch->execute();
    $post = $fetch->fetch(PDO::FETCH_ASSOC);

   

    
    //Construir URL base para avatares relativos
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

    $finalImage = $post['image_url'] ?? null;
    if ($finalImage && !preg_match('/^https?:\/\//i', $finalImage)) {
        $finalImage = $baseUrl . (str_starts_with($finalImage, '/') ? $finalImage : '/' . $finalImage);
    }

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Post criado com sucesso!',
        'post' => [
            'id' => (string)$post['id_post'],
            'email' => $post['email'],
            'descricao' => $post['descricao'],
            'image_url' => $finalImage,
            'data_publicacao' => $post['data_publicacao'],
            'author' => [
                'name' => $user['name'] ?: 'Membro',
                'avatar' => $avatar,
                'email' => $post['email']
            ],
        ],
    ]);

    

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Erro ao criar post.',
        'details' => $e->getMessage()
    ]);
}