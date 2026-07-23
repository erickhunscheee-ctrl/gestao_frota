<?php

class Usuario
{
    private $conn;
    private $table_name = "usuarios";

    // Propriedades
    public $id;
    public $nome;
    public $email;
    public $senha;
    public $cargo;
    public $iniciais;
    public $cor_avatar;
    public $telefone;
    public $empresa;
    public $unidade;
    public $cep;
    public $cidade;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function create()
    {
        $query = "INSERT INTO " . $this->table_name . " 
                (nome, email, senha, cargo, iniciais, cor_avatar, telefone, empresa, unidade, cep, cidade) 
                VALUES (:nome, :email, :senha, :cargo, :iniciais, :cor_avatar, :telefone, :empresa, :unidade, :cep, :cidade)";

        $stmt = $this->conn->prepare($query);
        $senha_hash = password_hash($this->senha, PASSWORD_BCRYPT);

        $stmt->bindParam(":nome", $this->nome);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":senha", $senha_hash);
        $stmt->bindParam(":cargo", $this->cargo);
        $stmt->bindParam(":iniciais", $this->iniciais);
        $stmt->bindParam(":cor_avatar", $this->cor_avatar);
        $stmt->bindParam(":telefone", $this->telefone);
        $stmt->bindParam(":empresa", $this->empresa);
        $stmt->bindParam(":unidade", $this->unidade);
        $stmt->bindParam(":cep", $this->cep);
        $stmt->bindParam(":cidade", $this->cidade);

        return $stmt->execute();
    }

    // READ ALL: Para listagem no admin-operadores.html
    public function readAll()
    {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY nome ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // READ ONE: Para perfil.html ou edicao
    public function readOne($id)
    {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // UPDATE: Editar perfil
    public function update()
    {
        $query = "UPDATE " . $this->table_name . " SET 
                    nome = :nome, 
                    email = :email, 
                    cargo = :cargo,
                    telefone = :telefone, 
                    unidade = :unidade,
                    cep = :cep,
                    cidade = :cidade
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":nome", $this->nome);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":cargo", $this->cargo);
        $stmt->bindParam(":telefone", $this->telefone);
        $stmt->bindParam(":unidade", $this->unidade);
        $stmt->bindParam(":cep", $this->cep);
        $stmt->bindParam(":cidade", $this->cidade);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // DELETE
    public function delete($id)
    {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }

    // LOGIN
    public function login($email, $password)
    {
        $query = "SELECT * FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($password == $row['senha']) {
                return $row;
            }
        }
        return false;
    }
    public function getEstatisticas($id)
    {
        $query = "SELECT 
                (SELECT SUM(horimetro_final - horimetro_inicial) FROM registros 
                 WHERE usuario_id = :id AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)) as horas_mes,
                (SELECT COUNT(*) FROM registros WHERE usuario_id = :id) as total_registros,
                (SELECT COUNT(DISTINCT maquina_id) FROM registros WHERE usuario_id = :id) as total_maquinas";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
