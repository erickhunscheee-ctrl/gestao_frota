<?php

class Database
{
    private $host = 'db.jgcafvpavrertzzjaoot.supabase.co';
    private $db_name   = 'postgres';
    private $username = 'postgres';
    private $password = '7VS2JvnsE3oofLPK';
    private $port = '5432';
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
