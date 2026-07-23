<?php
session_start();
header("Content-Type: application/json");

// Desativa erros na saída para não quebrar o JSON
error_reporting(0);
ini_set('display_errors', 0);

require_once '../../conexao_db/database.php';
require_once '../../maquinas/Maquinas.php';

// Proteção: Apenas administradores
if (!isset($_SESSION['usuario_cargo']) || $_SESSION['usuario_cargo'] !== 'admin') {
    http_response_code(403);
    exit(json_encode(["message" => "Acesso negado"]));
}

$database = new Database();
$db = $database->getConnection();
$maqObj = new Maquinas($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->nome)) {
    
    $maqObj->id = $data->id;
    $maqObj->nome = $data->nome;
    $maqObj->codigo_tag = $data->codigo_tag;
    $maqObj->modelo = $data->modelo;
    $maqObj->ano = (int)$data->ano;
    
    // Novos campos de ID (Inteiros)
    $maqObj->status_id = (int)$data->status_id;
    $maqObj->categoria_id = (int)$data->categoria_id;
    
    $maqObj->horimetro_atual = (float)$data->horimetro_atual;
    $maqObj->taxa_consumo = (float)$data->taxa_consumo;
    $maqObj->localizacao = $data->unidade; // ID da obra vinculada
    $maqObj->capacidade_m3 = isset($data->capacidade_m3) ? (float)$data->capacidade_m3 : 0;

    if ($maqObj->update()) {
        http_response_code(200);
        echo json_encode(["message" => "Máquina atualizada com sucesso!"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erro ao atualizar máquina no banco de dados."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Dados incompletos. ID e Nome são obrigatórios."]);
}