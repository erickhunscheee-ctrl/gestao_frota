<?php
session_start();
header("Content-Type: application/json");
error_reporting(0);
ini_set('display_errors', 0);

require_once '../../conexao_db/database.php';

if (!isset($_SESSION['usuario_cargo']) || $_SESSION['usuario_cargo'] !== 'admin') {
    http_response_code(403);
    exit(json_encode(["message" => "Acesso negado"]));
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $ops = $db->query("SELECT COUNT(*) FROM usuarios WHERE cargo != 'admin'")->fetchColumn();
    $maqs = $db->query("SELECT COUNT(*) FROM maquinas")->fetchColumn();
    $obras = $db->query("SELECT COUNT(*) FROM obras WHERE status IN ('ativa', 'planejada')")->fetchColumn();

    echo json_encode([
        "operadores" => (int)$ops,
        "maquinas" => (int)$maqs,
        "obras" => (int)$obras
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => $e->getMessage()]);
}
