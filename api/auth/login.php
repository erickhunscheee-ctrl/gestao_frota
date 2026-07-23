<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../../conexao_db/database.php';
require_once '../../usuario/Usuario.php';

$database = new Database();
$db = $database->getConnection();
$userObj = new Usuario($db);

// Recebe os dados brutos (JSON)
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->senha)) {
    $auth = $userObj->login($data->email, $data->senha);
    
    if ($auth) {
        // Criar variáveis de sessão
        $_SESSION['usuario_id'] = $auth['id'];
        $_SESSION['usuario_nome'] = $auth['nome'];
        $_SESSION['usuario_cargo'] = $auth['cargo'];

        http_response_code(200);
        echo json_encode([
            "message" => "Login realizado com sucesso!",
            "cargo" => $auth['cargo'],
            "nome" => $auth['nome'],
            "usuario_id" => $auth['id']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "E-mail ou senha incorretos."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Dados incompletos."]);
}