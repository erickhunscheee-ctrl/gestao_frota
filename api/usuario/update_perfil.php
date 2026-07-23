<?php
session_start();
header("Content-Type: application/json");
require_once '../../conexao_db/database.php';
require_once '../../usuario/Usuario.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    exit(json_encode(["message" => "Sessão expirada"]));
}

$database = new Database();
$db = $database->getConnection();
$userObj = new Usuario($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nome) && !empty($data->email)) {
    $userId = $_SESSION['usuario_id'];

    $usuarioAtual = $userObj->readOne($userId);

    // 2. Setamos as propriedades do objeto com os novos dados e mantemos os que n�o foram alterados
    $userObj->id = $userId;
    $userObj->nome = $data->nome;
    $userObj->email = $data->email;
    $userObj->telefone = $data->telefone;
    $userObj->unidade = $usuarioAtual['unidade']; // Mantemos a unidade do banco!

    // 3. Chamamos o m�todo update() da classe (sem argumentos)
    if ($userObj->update()) {
        $_SESSION['usuario_nome'] = $data->nome; // Atualiza a sess�o
        http_response_code(200);
        echo json_encode(["message" => "Perfil atualizado com sucesso!"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erro ao atualizar perfil."]);
    }

} else {
    http_response_code(400);
    echo json_encode(["message" => "Nome e E-mail s�o obrigat�rios."]);
}