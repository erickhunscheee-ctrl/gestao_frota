<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// Verifica se o usu�rio est� logado
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Sess�o expirada. Fa�a login novamente."]);
    exit;
}

require_once '../../conexao_db/database.php';
require_once '../../registro/Registro.php';

$database = new Database();
$db = $database->getConnection();
$regObj = new Registro($db);

$data = json_decode(file_get_contents("php://input"));

if (
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

    // Busca o horímetro atual no banco de dados para evitar retrocessos
    $stmtVinculo = $db->prepare("SELECT 1
        FROM obras o
        JOIN obra_operadores oo ON oo.obra_id = o.id AND oo.usuario_id = :usuario_id AND oo.ativo = TRUE
        JOIN obra_maquinas om ON om.obra_id = o.id AND om.maquina_id = :maquina_id AND om.ativo = TRUE
        WHERE o.id = :obra_id AND o.status IN ('planejada', 'ativa')");
    $stmtVinculo->execute([
        'usuario_id' => $_SESSION['usuario_id'],
        'maquina_id' => (int)$data->maquina_id,
        'obra_id' => (int)$data->obra_id
    ]);
    if (!$stmtVinculo->fetchColumn()) {
        http_response_code(400);
        echo json_encode(["message" => "O operador ou a maquina nao esta vinculado a esta obra."]);
        exit;
    }

    $query_maq = "SELECT horimetro_atual FROM maquinas WHERE id = :maq_id LIMIT 1";
    $stmt_maq = $db->prepare($query_maq);
    $stmt_maq->bindParam(":maq_id", $data->maquina_id);
    $stmt_maq->execute();
    $row_maq = $stmt_maq->fetch(PDO::FETCH_ASSOC);
    if ($row_maq) {
        $horimetro_atual = (float)$row_maq['horimetro_atual'];
        if ($hIni < $horimetro_atual) {
            http_response_code(400);
            echo json_encode(["message" => "O horímetro inicial ($hIni) não pode ser menor que o atual da máquina ($horimetro_atual)."]);
            exit;
        }
    }
    
    $regObj->usuario_id = $_SESSION['usuario_id'];
    $regObj->maquina_id = $data->maquina_id;
    $regObj->obra_id = isset($data->obra_id) && $data->obra_id !== '' ? (int)$data->obra_id : null;
    $regObj->data = $data->data;
    $regObj->hora_inicio = $data->hora_inicio;
    $regObj->hora_fim = $data->hora_fim;
    $regObj->horimetro_inicial = $hIni;
    $regObj->horimetro_final = $hFim;
    $regObj->producao_m3 = isset($data->producao_m3) ? $data->producao_m3 : 0;
    $regObj->status = "concluido";

    if ($regObj->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Apontamento registrado com sucesso!"]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Erro ao salvar no banco de dados."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Dados incompletos (Máquina, data, horários e horímetros são obrigatórios)."]);
}
