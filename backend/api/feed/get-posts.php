<?php



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


$limit  = isset($_GET['limit'])  ? max(1, min(100, (int)$_GET['limit']))  : 20;
$offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

try {
    //Garantir que a tabela de likes existe 
    $db->exec("
        CREATE TABLE IF NOT EXISTS post_likes (
            id_post INTEGER NOT NULL REFERENCES feed(id_post) ON DELETE CASCADE,
            email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (id_post, email)
        );
    ");

    $currentUser = isset($_GET['current_user']) ? strtolower(trim((string)$_GET['current_user'])) : '';

    /**
     * Query Principal: Procura os posts juntando dados do autor.
     * Inclui subqueries para contar Likes e Comentários, e verifica se o utilizador atual já deu Like.
     */
    $sql = "
        SELECT
            f.id_post,
            f.email,
            f.descricao,
            f.image_url,
            f.data_publicacao,
            u.name as author_name,
            u.avatar as author_avatar,
            (SELECT COUNT(*) FROM post_likes WHERE id_post = f.id_post) as likes_count,
            (SELECT COUNT(*) FROM post_comments WHERE id_post = f.id_post) as comments_count,
            (CASE WHEN EXISTS (SELECT 1 FROM post_likes WHERE id_post = f.id_post AND email = :current_user) THEN 1 ELSE 0 END) as is_liked
        FROM feed f
        JOIN users u ON f.email = u.email
        ORDER BY f.data_publicacao DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $db->prepare($sql);
    $stmt->bindParam(':limit',  $limit,  PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindParam(':current_user', $currentUser);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //Construir URL base para avatares relativos
    $isHttps  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $protocol = $isHttps ? 'https' : 'http';
    $host     = $_SERVER['HTTP_HOST'] ?? '127.0.0.1:8000';
    $baseUrl  = $protocol . '://' . $host;

    
    $posts = array_map(function (array $row) use ($baseUrl): array {
       
        $avatar = $row['author_avatar'] ?? '';
        if (!empty($avatar) && !preg_match('/^https?:\/\//i', $avatar)) {
            $avatar = $baseUrl . (str_starts_with($avatar, '/') ? $avatar : '/' . $avatar);
        }
        if (empty($avatar)) {
            $avatar = '/default-avatar.svg';
        }



        $finalImage = $row['image_url'] ?? null;
        if ($finalImage && !preg_match('/^https?:\/\//i', $finalImage)) {
            $finalImage = $baseUrl . (str_starts_with($finalImage, '/') ? $finalImage : '/' . $finalImage);
        }

        return [
            'id'         => (string)$row['id_post'],
            'email'      => (string)$row['email'],
            'descricao'  => $row['descricao'],
            'image_url'  => $finalImage,
            'created_at' => $row['data_publicacao'],
            'likes'      => (int)($row['likes_count'] ?? 0),
            'comments'   => (int)($row['comments_count'] ?? 0),
            'isLiked'    => (bool)($row['is_liked'] ?? 0),
            'author'     => [
                'name'   => $row['author_name'] ?? 'Membro',
                'avatar' => $avatar,
                'email'  => (string)$row['email'],
            ],
        ];
    }, $rows);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'posts'  => $posts,
        'count'  => count($posts),
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Erro ao buscar posts.',
        'details' => $e->getMessage()
    ]);
}
