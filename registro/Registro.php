<?php

class Registro
{
    private $conn;
    private $table_name = "registros";

    // Propriedades
    public $id;
    public $usuario_id;
    public $maquina_id;
    public $obra_id;
    public $data;
    public $hora_inicio;
    public $hora_fim;
    public $horimetro_inicial;
    public $horimetro_final;
    public $producao_m3; // 
    public $status; // 'concluido', 'pendente', 'revisao'

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // CREATE: Salvar novo apontamento
        public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                (usuario_id, maquina_id, obra_id, data, hora_inicio, hora_fim, horimetro_inicial, horimetro_final, producao_m3, status) 
                VALUES (:u_id, :m_id, :obra_id, :data, :h_ini, :h_fim, :hor_ini, :hor_fim, :prod, :status)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":u_id", $this->usuario_id);
        $stmt->bindParam(":m_id", $this->maquina_id);
        $stmt->bindParam(":obra_id", $this->obra_id);
        $stmt->bindParam(":data", $this->data);
        $stmt->bindParam(":h_ini", $this->hora_inicio);
        $stmt->bindParam(":h_fim", $this->hora_fim);
        $stmt->bindParam(":hor_ini", $this->horimetro_inicial);
        $stmt->bindParam(":hor_fim", $this->horimetro_final);
        $stmt->bindParam(":prod", $this->producao_m3);
        $stmt->bindParam(":status", $this->status);

        if($stmt->execute()){
            return $this->atualizarHorimetroMaquina();
        }
        return false;
    }

    // M�todo privado para atualizar o hor�metro da m�quina automaticamente
    private function atualizarHorimetroMaquina()
    {
        $query = "UPDATE maquinas SET horimetro_atual = :horimetro WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":horimetro", $this->horimetro_final);
        $stmt->bindParam(":id", $this->maquina_id);
        return $stmt->execute();
    }

    // READ ALL: Listagem completa para o Admin (Dashboard/Registros)
    public function readAll()
    {
        $query = "SELECT 
                    r.*, 
                    u.nome as usuario_nome, 
                    m.nome as maquina_nome, 
                    m.codigo_tag, 
                    m.categoria,
                    m.taxa_consumo
                  FROM " . $this->table_name . " r
                  JOIN usuarios u ON r.usuario_id = u.id
                  JOIN maquinas m ON r.maquina_id = m.id
                  ORDER BY r.data DESC, r.hora_inicio DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // READ BY USER: Hist�rico espec�fico do operador (tela historico.html)
 public function readByUsuario($usuario_id)
{
    $query = "SELECT 
                r.*, 
                m.nome as maquina_nome, 
                m.codigo_tag,
                m.taxa_consumo
              FROM " . $this->table_name . " r
              LEFT JOIN maquinas m ON r.maquina_id = m.id
              WHERE r.usuario_id = :u_id
              ORDER BY r.data DESC, r.hora_inicio DESC"; // Ordena pelo mais recente

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(":u_id", $usuario_id);
    $stmt->execute();
    return $stmt;
}

    // DELETE
    public function delete($id)
    {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }
}
