<?php

class Maquinas
{
    private $conn;
    private $table_name = "maquinas";

    // Propriedades atualizadas para IDs (Integer)
    public $id;
    public $nome;
    public $codigo_tag;
    public $modelo;
    public $ano;
    public $status_id;    
    public $categoria_id; 
    public $localizacao;
    public $horimetro_atual;
    public $taxa_consumo; 
    public $capacidade_m3; 

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function readAll()
    {
        $query = "SELECT 
                    m.*, 
                    s.nome as status_nome, 
                    s.classe_css as status_classe, 
                    c.nome as categoria_nome, 
                    c.unidade_medida
                  FROM " . $this->table_name . " m
                  LEFT JOIN status_maquina s ON m.status_id = s.id
                  LEFT JOIN categorias_maquina c ON m.categoria_id = c.id
                  ORDER BY m.nome ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // CREATE: Criar nova máquina usando IDs de referência
    public function create()
    {
        $query = "INSERT INTO " . $this->table_name . " 
                (nome, codigo_tag, modelo, ano, status_id, categoria_id, localizacao, horimetro_atual, taxa_consumo, capacidade_m3) 
                VALUES (:nome, :codigo_tag, :modelo, :ano, :status_id, :categoria_id, :local, :horimetro, :taxa, :cap_m3)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":nome", $this->nome);
        $stmt->bindParam(":codigo_tag", $this->codigo_tag);
        $stmt->bindParam(":modelo", $this->modelo);
        $stmt->bindParam(":ano", $this->ano);
        $stmt->bindParam(":status_id", $this->status_id);
        $stmt->bindParam(":categoria_id", $this->categoria_id);
        $stmt->bindParam(":local", $this->localizacao);
        $stmt->bindParam(":horimetro", $this->horimetro_atual);
        $stmt->bindParam(":taxa", $this->taxa_consumo);
        $stmt->bindParam(":cap_m3", $this->capacidade_m3);

        return $stmt->execute();
    }

    // UPDATE: Atualizar cadastro completo da máquina
    public function update()
    {
        $query = "UPDATE " . $this->table_name . " SET 
                    nome = :nome, 
                    codigo_tag = :codigo, 
                    modelo = :modelo, 
                    ano = :ano, 
                    status_id = :status_id, 
                    categoria_id = :categoria_id,
                    horimetro_atual = :horimetro, 
                    taxa_consumo = :taxa, 
                    localizacao = :local,
                    capacidade_m3 = :cap_m3
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":nome", $this->nome);
        $stmt->bindParam(":codigo", $this->codigo_tag);
        $stmt->bindParam(":modelo", $this->modelo);
        $stmt->bindParam(":ano", $this->ano);
        $stmt->bindParam(":status_id", $this->status_id);
        $stmt->bindParam(":categoria_id", $this->categoria_id);
        $stmt->bindParam(":horimetro", $this->horimetro_atual);
        $stmt->bindParam(":taxa", $this->taxa_consumo);
        $stmt->bindParam(":local", $this->localizacao);
        $stmt->bindParam(":cap_m3", $this->capacidade_m3);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // ATUALIZAR STATUS/HORÍMETRO: Chamado após um novo registro de operador
    public function atualizarDadosAtuais($id, $novo_horimetro, $novo_status_id = null)
    {
        $sql_status = $novo_status_id ? ", status_id = :status_id" : "";
        $query = "UPDATE " . $this->table_name . " SET horimetro_atual = :horimetro $sql_status WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":horimetro", $novo_horimetro);
        $stmt->bindParam(":id", $id);
        if ($novo_status_id) $stmt->bindParam(":status_id", $novo_status_id);

        return $stmt->execute();
    }
}