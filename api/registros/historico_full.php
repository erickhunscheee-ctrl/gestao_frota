<?php
session_start();
header("Content-Type: application/json");
require_once '../../conexao_db/database.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    exit(json_encode(["message" => "Sessão expirada"]));
}

$database = new Database();
$db = $database->getConnection();

// Pega mês e ano da URL ou usa o atual
$mes = isset($_GET['mes']) ? $_GET['mes'] : date('m');
$ano = isset($_GET['ano']) ? $_GET['ano'] : date('Y');
$user_id = $_SESSION['usuario_id'];

// 1. BUSCAR RESUMO (KPIs) DO MÊS
$queryStats = "SELECT 
    COALESCE(SUM(horimetro_final - horimetro_inicial), 0) as horas_totais,
    COUNT(*) as total_apontamentos,
    COUNT(DISTINCT maquina_id) as maquinas_usadas,
    COUNT(DISTINCT data) as dias_trabalhados
    FROM registros 
    WHERE usuario_id = :u_id 
    AND EXTRACT(MONTH FROM data) = :mes 
    AND EXTRACT(YEAR FROM data) = :ano";

$stmtStats = $db->prepare($queryStats);
$stmtStats->execute(['u_id' => $user_id, 'mes' => $mes, 'ano' => $ano]);
$stats = $stmtStats->fetch(PDO::FETCH_ASSOC);

// 2. BUSCAR REGISTROS PARA A LINHA DO TEMPO
$queryLogs = "SELECT r.*, m.nome as maquina_nome, m.codigo_tag 
    FROM registros r
    JOIN maquinas m ON r.maquina_id = m.id
    WHERE r.usuario_id = :u_id 
    AND EXTRACT(MONTH FROM data) = :mes 
    AND EXTRACT(YEAR FROM data) = :ano
    ORDER BY r.data DESC, r.hora_inicio DESC";

$stmtLogs = $db->prepare($queryLogs);
$stmtLogs->execute(['u_id' => $user_id, 'mes' => $mes, 'ano' => $ano]);
$logs = $stmtLogs->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "stats" => $stats,
    "logs" => $logs
]);