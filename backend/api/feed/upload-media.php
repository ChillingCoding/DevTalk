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

if (!isset($_FILES['media'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Nenhum ficheiro recebido na key "media".']);
    exit();
}

$file = $_FILES['media'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Erro no upload do ficheiro. Código: ' . $file['error']]);
    exit();
}

//Validar extensões de imagens seguras
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($extension, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Extensão de ficheiro não suportada.']);
    exit();
}

//Garantir que a pasta uploads/media existe
$uploadDir = __DIR__ . '/../../uploads/media/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

//Gerar nome unico
$filename = uniqid('media_', true) . '.' . $extension;
$destination = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    
    $relativePath = '/uploads/media/' . $filename;
    
    
    $isHttps  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $protocol = $isHttps ? 'https' : 'http';
    $host     = $_SERVER['HTTP_HOST'] ?? '127.0.0.1:8000';
    $absoluteUrl = $protocol . '://' . $host . $relativePath;

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'url' => $relativePath, 
        'absolute_url' => $absoluteUrl
    ]);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Impossível mapear ou mover o ficheiro para o diretorio de destino.']);
}
