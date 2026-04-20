<?php
// 1. Headers para REST API e CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Falha na ligação à base de dados.",
        "details" => $database->getLastError()
    ]);
    exit();
}

//Receber os dados do login (email e password)
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    try {
        $email = strtolower(trim((string)$data->email));

        //Procurar o utilizador pelo email
        $query = "SELECT id, name, password, avatar, created_at FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            //Verificar se a senha está correta
            // O password_verify compara a senha pura com o Hash do banco
            if (password_verify((string)$data->password, $row['password'])) {
                http_response_code(200);
                echo json_encode([
                    "status" => "success",
                    "message" => "Login realizado com sucesso!",
                    "user" => [
                        "id" => $row['id'],
                        "name" => $row['name'],
                        "avatar" => $row['avatar'] ?? null,
                        "created_at" => $row['created_at'] ?? null
                    ]
                ]);
            } else {
                // Senha errada
                http_response_code(401); // Unauthorized
                echo json_encode(["status" => "error", "message" => "Senha incorreta."]);
            }
        } else {
            // Email não encontrado
            http_response_code(404); // Not Found
            echo json_encode(["status" => "error", "message" => "Utilizador não encontrado."]);
        }
    } catch (PDOException $e) {
        http_response_code(500); //Internal server error
        echo json_encode(["status" => "error", "message" => "Erro no servidor."]);
    }
} else {
    http_response_code(400);// Bad Request 
    echo json_encode(["status" => "error", "message" => "Dados incompletos."]);
}
