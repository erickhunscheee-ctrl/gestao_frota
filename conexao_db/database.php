<?php

class Database
{
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;

    public $conn;

    public function __construct()
    {
        $this->host = getenv('DB_HOST') ?: 'localhost';
        $this->db_name = getenv('DB_DATABASE') ?: 'gestao_frota';
        $this->username = getenv('DB_USERNAME') ?: 'postgres';
        $this->password = getenv('DB_PASSWORD') ?: '';
        $this->port = getenv('DB_PORT') ?: '5432';
    }

    public function getConnection()
    {
        $this->conn = null;

        try {
            $dsn = sprintf(
                'pgsql:host=%s;port=%s;dbname=%s',
                $this->host,
                $this->port,
                $this->db_name
            );

            $this->conn = new PDO(
                $dsn,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $exception) {
            error_log('Erro de conexão com o PostgreSQL: ' . $exception->getMessage());

            echo 'Erro de conexão com o banco de dados.';
        }

        return $this->conn;
    }
}