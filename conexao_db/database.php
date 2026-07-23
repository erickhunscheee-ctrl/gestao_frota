<?php

class Database
{
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;

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
        if ($this->host === '') {
            throw new RuntimeException('DB_HOST não configurado.');
        }

        if ($this->db_name === '') {
            throw new RuntimeException('DB_DATABASE não configurado.');
        }

        if ($this->username === '') {
            throw new RuntimeException('DB_USERNAME não configurado.');
        }

        $dsn = sprintf(
            'pgsql:host=%s;port=%s;dbname=%s',
            $this->host,
            $this->port,
            $this->db_name
        );

        return new PDO(
            $dsn,
            $this->username,
            $this->password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
    }
}
