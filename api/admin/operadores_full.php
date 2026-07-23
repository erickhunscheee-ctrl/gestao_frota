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

// 1. BUSCAR KPIs DO TOPO (Ajustado para contar todos que não são admin)
$queryStats = "SELECT 
    (SELECT COUNT(*) FROM usuarios WHERE cargo != 'admin') as total,
    (SELECT COUNT(DISTINCT usuario_id) FROM registros WHERE data = CURRENT_DATE) as ativos";
$stats = $db->query($queryStats)->fetch(PDO::FETCH_ASSOC);

// 2. BUSCAR LISTA DE OPERADORES (Ajustado para filtrar todos que não são admin)
$queryOps = "SELECT 
                u.id, u.nome, u.cargo, u.iniciais, u.cor_avatar, u.unidade, u.email, u.cep, u.cidade,
                r.horimetro_final,
                m.nome as maquina_nome,
                (r.horimetro_final - r.horimetro_inicial) as horas_hoje,
                ((r.horimetro_final - r.horimetro_inicial) * m.taxa_consumo) as fuel_hoje,
                CASE WHEN r.id IS NOT NULL THEN 'working' ELSE 'offline' END as status_real
             FROM usuarios u
             LEFT JOIN registros r ON u.id = r.usuario_id AND r.data = CURRENT_DATE
             LEFT JOIN maquinas m ON r.maquina_id = m.id
             WHERE u.cargo != 'admin' 
             ORDER BY status_real DESC, u.nome ASC";

$operadores = $db->query($queryOps)->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "stats" => [
        "total" => (int)$stats['total'],
        "ativos" => (int)$stats['ativos'],
        "offline" => (int)$stats['total'] - (int)$stats['ativos']
    ],
    "operadores" => $operadores
]);