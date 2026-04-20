<?php
class Database {
    /**
     * Propriedades de Configuração: Definem as credenciais e o endereço do servidor PostgreSQL.
     */
    private $host = "localhost";
    private $port = "5433";
    private $db_name = "Backend";
    private $username = "renato";
    private $password = "";
    public $conn;
    private $lastError = null;

    /**
     * Inicialização da Ligação: Configura o PDO com as opções de segurança 
     * e tratamento de erros necessárias para o ambiente de produção.
     */
    public function getConnection() {
        $this->conn = null;
        $this->lastError = null;
        try {
            // String de conexão para PostgreSQL
            $dsn = "pgsql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name;
            $this->conn = new PDO($dsn, $this->username, $this->password);
            
            // Define para lançar exceções em caso de erro
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            // No REST, erros de conexão devem ser tratados com cuidado
            $this->lastError = $e->getMessage();
            error_log("Erro de conexão: " . $e->getMessage());
        }
        return $this->conn;
    }

    public function getLastError() {
        return $this->lastError;
    }
}
?>
