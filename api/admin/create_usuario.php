<?php
session_start();
header("Content-Type: application/json");
require_once '../../conexao_db/database.php';
require_once '../../usuario/Usuario.php';

// Proteção: Apenas admin
if (!isset($_SESSION['usuario_cargo']) || $_SESSION['usuario_cargo'] !== 'admin') {
    http_response_code(403);
    exit(json_encode(["message" => "Acesso negado"]));
}

$database = new Database();
$db = $database->getConnection();
$userObj = new Usuario($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nome) && !empty($data->email)) {
    
    // 1. Geração de Iniciais (Ex: "João Silva" -> "JS")
    $nomes = explode(" ", trim($data->nome));
    $iniciais = strtoupper(substr($nomes[0], 0, 1));
    if (count($nomes) > 1) {
        $iniciais .= strtoupper(substr(end($nomes), 0, 1));
    }

    // 2. Preenchimento do Objeto Usuario
    $userObj->nome = $data->nome;
    $userObj->email = $data->email;
    $userObj->senha = $data->senha; // A classe Usuario.php já faz o hash
    $userObj->cargo = $data->cargo;
    $userObj->iniciais = $iniciais;
    $userObj->cor_avatar = "c" . rand(1, 8); // Atribui cor aleatória c1 a c8
    $userObj->telefone = $data->telefone;
    $userObj->unidade = $data->unidade; // Obra vinculada
    $userObj->empresa = "Verda"; 
    $userObj->cep = isset($data->cep) ? $data->cep : null;
    $userObj->cidade = isset($data->cidade) ? $data->cidade : null;

    if ($userObj->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Operador cadastrado com sucesso!"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Erro ao cadastrar operador no banco."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Nome e E-mail são obrigatórios."]);
}