<?php
session_start();
header("Content-Type: application/json");
require_once '../../conexao_db/database.php';
require_once '../../maquinas/Maquinas.php';

// Proteção: Apenas admin
if (!isset($_SESSION['usuario_cargo']) || $_SESSION['usuario_cargo'] !== 'admin') {
    http_response_code(403);
    exit(json_encode(["message" => "Acesso negado"]));
}

$database = new Database();
$db = $database->getConnection();
$maqObj = new Maquinas($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nome) && !empty($data->codigo_tag)) {

    // Preenchimento do Objeto Maquina
    $maqObj->nome = $data->nome;
    $maqObj->codigo_tag = $data->codigo_tag;
    $maqObj->modelo = $data->modelo;
    $maqObj->ano = (int)$data->ano;
    $maqObj->status_id = (int)$data->status_id;       // Recebe ID (1, 2 ou 3)
    $maqObj->categoria_id = (int)$data->categoria_id;
    $maqObj->horimetro_atual = (float)$data->horimetro_atual;
    $maqObj->taxa_consumo = (float)$data->taxa_consumo;
    $maqObj->localizacao = $data->unidade; // Usamos o campo de obra vinculada como localização inicial
    $maqObj->capacidade_m3 = 0;

    if ($maqObj->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Máquina cadastrada com sucesso!"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erro ao cadastrar máquina no banco."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Nome e Código/TAG são obrigatórios."]);
}
