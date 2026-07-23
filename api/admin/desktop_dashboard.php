<?php
// api/admin/desktop_dashboard.php
session_start();
header("Content-Type: application/json");

// Desativa a exibição de erros do PHP na saída (para não sujar o JSON)
error_reporting(0);
ini_set('display_errors', 0);

require_once '../../conexao_db/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // 1. Query KPIs
    $kpis = $db->query("
        SELECT 
            (SELECT COUNT(DISTINCT usuario_id) FROM registros WHERE data = CURRENT_DATE) as ops,
            (SELECT COUNT(*) FROM maquinas WHERE status = 'ativa') as maq,
            (SELECT COALESCE(SUM(horimetro_final - horimetro_inicial), 0) FROM registros WHERE data = CURRENT_DATE) as horas,
            (SELECT COALESCE(SUM((r.horimetro_final - r.horimetro_inicial) * m.taxa_consumo), 0) 
             FROM registros r JOIN maquinas m ON r.maquina_id = m.id WHERE r.data = CURRENT_DATE) as litros
    ")->fetch(PDO::FETCH_ASSOC);

    // 2. Query Gráfico 14 dias
    $horas_14d = $db->query("
        SELECT data, SUM(horimetro_final - horimetro_inicial) as total 
        FROM registros WHERE data >= CURRENT_DATE - INTERVAL '13 days'
        GROUP BY data ORDER BY data ASC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // 3. Query Combustível Ranking
    $fuel = $db->query("
        SELECT m.nome, m.codigo_tag, SUM((r.horimetro_final - r.horimetro_inicial) * m.taxa_consumo) as litros
        FROM registros r JOIN maquinas m ON r.maquina_id = m.id 
        WHERE r.data = CURRENT_DATE GROUP BY m.nome, m.codigo_tag ORDER BY litros DESC LIMIT 5
    ")->fetchAll(PDO::FETCH_ASSOC);

    // 4. Query Operadores Live
    $live = $db->query("
        SELECT u.nome, u.iniciais, m.nome as maquina, u.unidade, (r.horimetro_final - r.horimetro_inicial) as horas
        FROM registros r JOIN usuarios u ON r.usuario_id = u.id JOIN maquinas m ON r.maquina_id = m.id
        WHERE r.data = CURRENT_DATE ORDER BY r.hora_inicio DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // 5. Query Status da Frota
    $status = $db->query("SELECT status, COUNT(*) as qtd FROM maquinas GROUP BY status")->fetchAll(PDO::FETCH_ASSOC);

    // RESULTADO FINAL (ÚNICO ECHO NO ARQUIVO INTEIRO)
    echo json_encode([
        "kpis" => $kpis,
        "chart_horas" => $horas_14d,
        "chart_fuel" => $fuel,
        "live_ops" => $live,
        "chart_status" => $status
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}