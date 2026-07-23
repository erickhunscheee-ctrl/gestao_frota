<?php
// api/usuario/perfil_dados.php
session_start();
header("Content-Type: application/json; charset=UTF-8");

require_once '../../conexao_db/database.php';
require_once '../../usuario/Usuario.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    exit(json_encode(["message" => "Não autorizado"]));
}

$database = new Database();
$db = $database->getConnection();
$userObj = new Usuario($db);

// 1. Pega os dados básicos do usuário
$dadosBase = $userObj->readOne($_SESSION['usuario_id']);

// 2. Pega as estatísticas (Horas, Registros, Máquinas)
$stats = $userObj->getEstatisticas($_SESSION['usuario_id']);

if ($dadosBase) {
    // Removemos a senha por segurança antes de enviar para o front
    unset($dadosBase['senha']);

    echo json_encode([
        "perfil" => $dadosBase,
        "estatisticas" => [
            "horas_mes" => round($stats['horas_mes'] ?? 0, 1),
            "total_registros" => $stats['total_registros'] ?? 0,
            "total_maquinas" => $stats['total_maquinas'] ?? 0
        ]
    ]);
} else {
    http_response_code(404);
    echo json_encode(["message" => "Usuário não encontrado."]);
}