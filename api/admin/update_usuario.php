<?php
session_start();
header("Content-Type: application/json");
require_once '../../conexao_db/database.php';
require_once '../../usuario/Usuario.php';

if (!isset($_SESSION['usuario_cargo']) || $_SESSION['usuario_cargo'] !== 'admin') {
    http_response_code(403);
    exit(json_encode(["message" => "Acesso negado"]));
}

$database = new Database();
$db = $database->getConnection();
$userObj = new Usuario($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->nome)) {
    // Carrega os dados atuais para não perder campos não editáveis no modal
    $atual = $userObj->readOne($data->id);

    $userObj->id = $data->id;
    $userObj->nome = $data->nome;
    $userObj->email = $data->email;
    $userObj->telefone = $data->telefone;
    $userObj->unidade = $data->unidade;
    $userObj->cargo = $data->cargo; // Nível (Sênior, Pleno...)
    $userObj->cep = isset($data->cep) ? $data->cep : null;
    $userObj->cidade = isset($data->cidade) ? $data->cidade : null;

    if ($userObj->update()) {
        echo json_encode(["message" => "Operador atualizado com sucesso!"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erro ao atualizar operador."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Dados incompletos."]);
}
