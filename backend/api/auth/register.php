<?php

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
    $details = $database->getLastError();
    echo json_encode([
        "status" => "error",
        "message" => "Falha na ligação à base de dados. Verifica host/porta/db/utilizador/password no backend/config/database.php.",
        "details" => $details
    ]);
    exit();
}

function validatePassword(string $password): ?string {
    if (strlen($password) < 8) {
        return "A senha deve ter pelo menos 8 caracteres.";
    }
    else if (!preg_match('/[a-z]/', $password)) {
        return "A senha deve conter pelo menos uma letra minúscula.";
    }
    else if (!preg_match('/[A-Z]/', $password)) {
        return "A senha deve conter pelo menos uma letra maiúscula.";
    }
    else if (!preg_match('/[0-9]/', $password)) {
        return "A senha deve conter pelo menos um número.";
    }
    else if (!preg_match('/[^a-zA-Z0-9]/', $password)) {
        return "A senha deve conter pelo menos um símbolo (ex.: !@#$%).";
    }

    return null;
}


$data = json_decode(file_get_contents("php://input"));


if (
    !empty($data->name) &&
    !empty($data->email) &&
    !empty($data->password)
) {
    try {
        $name = trim((string)$data->name);
        $email = strtolower(trim((string)$data->email));
        $password = (string)$data->password;

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(["status" => "error", "message" => "E-mail inválido."]);
            exit();
        }

        $passwordError = validatePassword($password);
        if ($passwordError !== null) {
            http_response_code(422);
            echo json_encode(["status" => "error", "message" => $passwordError]);
            exit();
        }

        
        $query = "INSERT INTO users (name, email, password) VALUES (:name, :email, :password)";
        $stmt = $db->prepare($query);

       
        $password_hash = password_hash($password, PASSWORD_BCRYPT);

      
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password", $password_hash);

        
        if($stmt->execute()) {
            http_response_code(201); // Created
            echo json_encode(["status" => "success", "message" => "Usuário criado com sucesso!"]);
        }
    } catch (PDOException $e) {
       
        http_response_code(400); 
        echo json_encode(["status" => "error", "message" => "E-mail já cadastrado ou erro no banco."]);
    }
} else {

    http_response_code(400); // Bad Request
    echo json_encode(["status" => "error", "message" => "Preencha todos os campos."]);
}
