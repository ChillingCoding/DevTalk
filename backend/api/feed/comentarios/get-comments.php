<?php
/**
 * GET /api/feed/get-comments.php
 * Devolve todos os comentários de um post específico.
 * Lógica: query param ?post_id=X
 */

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método não permitido. Use GET.']);
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

$postId = isset($_GET['post_id']) ? (int)$_GET['post_id'] : 0;

if ($postId <= 0) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'O parâmetro post_id é obrigatório.']);
    exit();
}

try {
    $sql = "
        SELECT
            c.id_comment,
            c.email,
            c.content,
            c.created_at,
            u.name as author_name,
            u.avatar as author_avatar
        FROM post_comments c
        JOIN users u ON c.email = u.email
        WHERE c.id_post = :post_id
        ORDER BY c.created_at ASC
    ";

    $stmt = $db->prepare($sql);
    $stmt->bindParam(':post_id', $postId, PDO::PARAM_INT);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Construir URL base para avatares relativos
    $isHttps  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $protocol = $isHttps ? 'https' : 'http';
    $host     = $_SERVER['HTTP_HOST'] ?? '127.0.0.1:8000';
    $baseUrl  = $protocol . '://' . $host;

    $comments = array_map(function (array $row) use ($baseUrl): array {
        // Normaliza avatar
        $avatar = $row['author_avatar'] ?? '';
        if (!empty($avatar) && !preg_match('/^https?:\/\//i', $avatar)) {
            $avatar = $baseUrl . (str_starts_with($avatar, '/') ? $avatar : '/' . $avatar);
        }
        if (empty($avatar)) {
            $avatar = '/default-avatar.svg';
        }



        return [
            'id'         => (string)$row['id_comment'],
            'email'      => (string)$row['email'],
            'name'       => $row['author_name'] ?? 'Membro',
            'avatar'     => $avatar,
            'content'    => $row['content'],
            'created_at' => $row['created_at'],
        ];
    }, $rows);

    http_response_code(200);
    echo json_encode([
        'status'   => 'success',
        'comments' => $comments,
        'count'    => count($comments),
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Erro ao buscar comentários.',
        'details' => $e->getMessage()
    ]);
}
