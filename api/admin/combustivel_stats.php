<?php
session_start();
header("Content-Type: application/json");
require_once '../../conexao_db/database.php';

if (!isset($_SESSION['usuario_cargo']) || $_SESSION['usuario_cargo'] !== 'admin') {
    http_response_code(403);
    exit(json_encode(["message" => "Acesso negado"]));
}

$database = new Database();
$db = $database->getConnection();

$diesel_preco = 6.50; // Valor fixo atualizado para 6.50

// 1. KPIs GERAIS (HOJE)
$queryKPIs = "SELECT 
    SUM((r.horimetro_final - r.horimetro_inicial) * m.taxa_consumo) as total_litros,
    SUM(r.horimetro_final - r.horimetro_inicial) as total_horas
    FROM registros r 
    JOIN maquinas m ON r.maquina_id = m.id 
    WHERE r.data = CURRENT_DATE";

$kpis = $db->query($queryKPIs)->fetch(PDO::FETCH_ASSOC);
$total_litros = $kpis['total_litros'] ?? 0;
$total_horas = $kpis['total_horas'] ?? 0;

// 2. DADOS DO GR�FICO (�LTIMOS 7 DIAS)
$queryChart = "SELECT 
    data, 
    SUM((r.horimetro_final - r.horimetro_inicial) * m.taxa_consumo) as litros
    FROM registros r
    JOIN maquinas m ON r.maquina_id = m.id
    WHERE data >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY data ORDER BY data ASC";
$chartData = $db->query($queryChart)->fetchAll(PDO::FETCH_ASSOC);

// 3. RANKING POR CONSUMO (HOJE)
$queryRanking = "SELECT 
    m.nome, m.codigo_tag, m.taxa_consumo,
    u.nome as operador,
    (r.horimetro_final - r.horimetro_inicial) as horas,
    ((r.horimetro_final - r.horimetro_inicial) * m.taxa_consumo) as litros
    FROM registros r
    JOIN maquinas m ON r.maquina_id = m.id
    JOIN usuarios u ON r.usuario_id = u.id
    WHERE r.data = CURRENT_DATE
    ORDER BY litros DESC";
$ranking = $db->query($queryRanking)->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "kpis" => [
        "litros" => round($total_litros, 1),
        "horas" => round($total_horas, 1),
        "media_lh" => $total_horas > 0 ? round($total_litros / $total_horas, 1) : 0,
        "custo" => round($total_litros * $diesel_preco, 2)
    ],
    "chart" => $chartData,
    "ranking" => $ranking
]);
