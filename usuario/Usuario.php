<?php

class Usuario
{
    private PDO $conn;
    private string $table_name = 'usuarios';

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
        if (!$db instanceof PDO) {
            throw new RuntimeException(
                'A conexão com o banco de dados não está disponível.'
            );
        }

        $this->conn = $db;
    }

    public function create(): bool
    {
        $query = "
            INSERT INTO {$this->table_name}
            (
                nome,
                email,
                senha,
                cargo,
                iniciais,
                cor_avatar,
                telefone,
                empresa,
                unidade,
                cep,
                cidade
            )
            VALUES
            (
                :nome,
                :email,
                :senha,
                :cargo,
                :iniciais,
                :cor_avatar,
                :telefone,
                :empresa,
                :unidade,
                :cep,
                :cidade
            )
        ";

        $stmt = $this->conn->prepare($query);

        $senhaHash = password_hash($this->senha, PASSWORD_BCRYPT);

        return $stmt->execute([
            ':nome' => $this->nome,
            ':email' => $this->email,
            ':senha' => $senhaHash,
            ':cargo' => $this->cargo,
            ':iniciais' => $this->iniciais,
            ':cor_avatar' => $this->cor_avatar,
            ':telefone' => $this->telefone,
            ':empresa' => $this->empresa,
            ':unidade' => $this->unidade,
            ':cep' => $this->cep,
            ':cidade' => $this->cidade,
        ]);
    }

    public function readAll(): PDOStatement
    {
        $query = "
            SELECT *
            FROM {$this->table_name}
            ORDER BY nome ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    public function readOne($id)
    {
        $query = "
            SELECT *
            FROM {$this->table_name}
            WHERE id = :id
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);

        $stmt->execute([
            ':id' => $id,
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }

    public function update(): bool
    {
        $query = "
            UPDATE {$this->table_name}
            SET
                nome = :nome,
                email = :email,
                cargo = :cargo,
                telefone = :telefone,
                unidade = :unidade,
                cep = :cep,
                cidade = :cidade
            WHERE id = :id
        ";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ':nome' => $this->nome,
            ':email' => $this->email,
            ':cargo' => $this->cargo,
            ':telefone' => $this->telefone,
            ':unidade' => $this->unidade,
            ':cep' => $this->cep,
            ':cidade' => $this->cidade,
            ':id' => $this->id,
        ]);
    }

    public function delete($id): bool
    {
        $query = "
            DELETE FROM {$this->table_name}
            WHERE id = :id
        ";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ':id' => $id,
        ]);
    }

    public function login(string $email, string $password)
    {
        $query = "
            SELECT *
            FROM {$this->table_name}
            WHERE LOWER(email) = LOWER(:email)
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);

        $stmt->execute([
            ':email' => trim($email),
        ]);

        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            return false;
        }

        $senhaValida = password_verify(
            $password,
            $usuario['senha']
        );

        /*
         * Compatibilidade temporária para usuários antigos
         * que ainda possuem a senha salva em texto puro.
         */
        if (!$senhaValida && hash_equals((string) $usuario['senha'], $password)) {
            $senhaValida = true;

            $this->atualizarSenhaHash(
                $usuario['id'],
                $password
            );
        }

        if (!$senhaValida) {
            return false;
        }

        unset($usuario['senha']);

        return $usuario;
    }

    private function atualizarSenhaHash($id, string $password): void
    {
        $query = "
            UPDATE {$this->table_name}
            SET senha = :senha
            WHERE id = :id
        ";

        $stmt = $this->conn->prepare($query);

        $stmt->execute([
            ':senha' => password_hash($password, PASSWORD_BCRYPT),
            ':id' => $id,
        ]);
    }

    public function getEstatisticas($id)
    {
        $query = "
            SELECT
                (
                    SELECT COALESCE(
                        SUM(horimetro_final - horimetro_inicial),
                        0
                    )
                    FROM registros
                    WHERE usuario_id = :id
                      AND EXTRACT(MONTH FROM data) =
                          EXTRACT(MONTH FROM CURRENT_DATE)
                      AND EXTRACT(YEAR FROM data) =
                          EXTRACT(YEAR FROM CURRENT_DATE)
                ) AS horas_mes,

                (
                    SELECT COUNT(*)
                    FROM registros
                    WHERE usuario_id = :id
                ) AS total_registros,

                (
                    SELECT COUNT(DISTINCT maquina_id)
                    FROM registros
                    WHERE usuario_id = :id
                ) AS total_maquinas
        ";

        $stmt = $this->conn->prepare($query);

        $stmt->execute([
            ':id' => $id,
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
