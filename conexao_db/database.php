<?php

class Database
{
    private string $host;
    private string $db_name;
    private string $username;
    private string $password;
    private string $port;

    public function __construct()
    {
        $this->host = getenv('DB_HOST') ?: '';
        $this->db_name = getenv('DB_DATABASE') ?: '';
        $this->username = getenv('DB_USERNAME') ?: '';
        $this->password = getenv('DB_PASSWORD') ?: '';
        $this->port = getenv('DB_PORT') ?: '5432';
    }

    public function getConnection(): PDO
    {
        if (
            empty($this->host) ||
            empty($this->db_name) ||
            empty($this->username)
        ) {
            throw new RuntimeException(
                'Variáveis do banco não foram configuradas corretamente.'
            );
        }

        $dsn = sprintf(
            'pgsql:host=%s;port=%s;dbname=%s',
            $this->host,
            $this->port,
            $this->db_name
        );

        try {
            return new PDO(
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
            error_log(
                'Erro PostgreSQL: ' . $exception->getMessage()
            );

            throw new RuntimeException(
                'Não foi possível conectar ao banco de dados.',
                0,
                $exception
            );
        }
    }
}