<?php

class Database
{
    private $host = getenv('DB_HOST');
    private $db_name = getenv('DB_DATABASE');
    private $username = getenv('DB_USERNAME');
    private $password = getenv('DB_PASSWORD');
    private $port = getenv('DB_PORT');

    public $conn;

    public function getConnection()
    {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "pgsql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $exception) {
            echo "Erro de conexão: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
