<?php
session_start();
header("Content-Type: application/json");
require_once '../../conexao_db/database.php';

// Proteção: só admin pode ver
if (!isset($_SESSION['usuario_cargo']) || $_SESSION['usuario_cargo'] !== 'admin') {
    http_response_code(403);
    exit(json_encode(["message" => "Acesso negado"]));
}

$database = new Database();
$db = $database->getConnection();

// --- 1. KPIs (TOP CARDS) ---
$queryKPIs = "SELECT 
    (SELECT COUNT(DISTINCT usuario_id) FROM registros WHERE data = CURRENT_DATE) as ops_ativos,
    (SELECT COUNT(*) FROM maquinas WHERE status = 'ativa') as maquinas_uso,
    (SELECT SUM((r.horimetro_final - r.horimetro_inicial) * m.taxa_consumo) 
     FROM registros r JOIN maquinas m ON r.maquina_id = m.id WHERE r.data = CURRENT_DATE) as fuel_hoje,
    (SELECT SUM(horimetro_final - horimetro_inicial) FROM registros WHERE data = CURRENT_DATE) as horas_hoje";

$stmtKPIs = $db->query($queryKPIs);
$kpis = $stmtKPIs->fetch(PDO::FETCH_ASSOC);

// --- 2. CONSUMO POR MÁQUINA (FUEL BREAKDOWN) ---
$queryFuel = "SELECT m.nome, SUM((r.horimetro_final - r.horimetro_inicial) * m.taxa_consumo) as total_litros
    FROM registros r
    JOIN maquinas m ON r.maquina_id = m.id
    WHERE r.data = CURRENT_DATE
    GROUP BY m.nome ORDER BY total_litros DESC LIMIT 5";

$stmtFuel = $db->query($queryFuel);
$fuelBreakdown = $stmtFuel->fetchAll(PDO::FETCH_ASSOC);

// --- 3. OPERADORES EM CAMPO (LISTA INFERIOR) ---
$queryOps = "SELECT u.nome, u.iniciais, m.nome as maquina, u.unidade, (r.horimetro_final - r.horimetro_inicial) as horas_hoje
    FROM registros r
    JOIN usuarios u ON r.usuario_id = u.id
    JOIN maquinas m ON r.maquina_id = m.id
    WHERE r.data = CURRENT_DATE
    ORDER BY r.hora_inicio DESC";

$stmtOps = $db->query($queryOps);
$opsAtivos = $stmtOps->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "kpis" => $kpis,
    "fuel_breakdown" => $fuelBreakdown,
    "operadores_campo" => $opsAtivos
]);