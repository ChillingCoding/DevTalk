<?php
class Database
{
    /**
     * Propriedades de Configuração: Definem as credenciais e o endereço do servidor PostgreSQL.
     */
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;

    public function __construct() {
        $this->host = getenv('DB_HOST') ?: "localhost";
        $this->port = getenv('DB_PORT') ?: "5433";
        $this->db_name = getenv('DB_NAME') ?: "Backend";
        $this->username = getenv('DB_USER') ?: "renato";
        $this->password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : "";
    }
    public $conn;
    private $lastError = null;

    /**
     * Inicialização da Ligação: Configura o PDO com as opções de segurança 
     * e tratamento de erros necessárias para o ambiente de produção.
     */
    public function getConnection()
    {
        $this->conn = null;
        $this->lastError = null;
        try {
            $dsn = "pgsql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name;
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Verifica e inicializa a base de dados se estiver vazia
            $this->initializeDatabaseIfEmpty();
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            error_log("Erro de conexão: " . $e->getMessage());
        }
        return $this->conn;
    }

    private function initializeDatabaseIfEmpty()
    {
        try {
            // Verifica se a tabela principal 'users' existe
            $check = $this->conn->query("SELECT 1 FROM information_schema.tables WHERE table_name = 'users' LIMIT 1");
            if ($check->rowCount() == 0) {
                // Se não existir, corre o script de configuração total
                $sqlFile = __DIR__ . '/../docs/full_setup.sql';
                if (file_exists($sqlFile)) {
                    $sql = file_get_contents($sqlFile);
                    $this->conn->exec($sql);
                    error_log("Base de dados inicializada automaticamente pelo motor.");
                }
            }
        } catch (Exception $e) {
            error_log("Erro na inicialização automática: " . $e->getMessage());
        }
    }

    public function getLastError()
    {
        return $this->lastError;
    }
}
?>
