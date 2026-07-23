<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// Verifica se o usuário é administrador
if (!isset($_SESSION['usuario_cargo']) || $_SESSION['usuario_cargo'] !== 'admin') {
    http_response_code(403);
    exit(json_encode(["message" => "Acesso negado. Apenas administradores podem fazer isso."]));
}

require_once '../../conexao_db/database.php';
require_once '../../registro/Registro.php';

$database = new Database();
$db = $database->getConnection();
$regObj = new Registro($db);

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->usuario_id) &&
    !empty($data->maquina_id) &&
    !empty($data->obra_id) &&
    !empty($data->data) && 
    !empty($data->hora_inicio) && 
    !empty($data->hora_fim) && 
    isset($data->horimetro_inicial) && $data->horimetro_inicial !== '' &&
    isset($data->horimetro_final) && $data->horimetro_final !== ''
) {
    $hIni = (float)$data->horimetro_inicial;
    $hFim = (float)$data->horimetro_final;

    if ($hIni < 0 || $hFim < 0) {
        http_response_code(400);
        echo json_encode(["message" => "Os horímetros não podem ser negativos."]);
        exit;
    }

    if ($hFim < $hIni) {
        http_response_code(400);
        echo json_encode(["message" => "O horímetro final não pode ser menor que o horímetro inicial."]);
        exit;
    }

    if ($data->hora_fim <= $data->hora_inicio) {
        http_response_code(400);
        echo json_encode(["message" => "A hora de fim deve ser posterior à hora de início."]);
        exit;
    }

    $regObj->usuario_id = $data->usuario_id;
    $regObj->maquina_id = $data->maquina_id;
    $regObj->obra_id = isset($data->obra_id) && $data->obra_id !== '' ? (int)$data->obra_id : null;
    $regObj->data = $data->data;
    $regObj->hora_inicio = $data->hora_inicio;
    $regObj->hora_fim = $data->hora_fim;
    $regObj->horimetro_inicial = $hIni;
    $regObj->horimetro_final = $hFim;
    $regObj->producao_m3 = isset($data->producao_m3) ? (int)$data->producao_m3 : 0;
    $regObj->status = "concluido";

    if ($regObj->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Apontamento registrado com sucesso!"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erro ao salvar no banco de dados."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Dados incompletos (Operador, Máquina, data, horários e horímetros são obrigatórios)."]);
}
