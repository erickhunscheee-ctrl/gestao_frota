<?php
session_start();
header("Content-Type: application/json");

// Desativa exibição de erros para não quebrar o JSON
error_reporting(0);
ini_set('display_errors', 0);

require_once '../../conexao_db/database.php';

// Proteção: apenas admin pode acessar
if (!isset($_SESSION['usuario_cargo']) || $_SESSION['usuario_cargo'] !== 'admin') {
    http_response_code(403);
    exit(json_encode(["message" => "Acesso negado"]));
}

$database = new Database();
$db = $database->getConnection();

try {
    // 1. BUSCAR ESTATÍSTICAS (KPIs DO TOPO)
    // Usamos os IDs: 1 = Ativa, 2 = Manutenção, 3 = Inativa
    $queryStats = "SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status_id = 1 THEN 1 END) as em_uso,
        COUNT(CASE WHEN status_id = 2 THEN 1 END) as manutencao,
        COUNT(CASE WHEN status_id = 3 THEN 1 END) as inativa
        FROM maquinas";

    $stmtStats = $db->query($queryStats);
    $stats = $stmtStats->fetch(PDO::FETCH_ASSOC);

    // 2. BUSCAR LISTA DE MÁQUINAS COM JOINs
    // Trazemos o status_nome e status_classe para o d-maquinas.js usar
    $queryMaq = "SELECT 
                    m.*,
                    s.nome as status_nome,
                    s.classe_css as status_classe,
                    c.nome as categoria_nome,
                    u.nome as operador_nome,
                    u.iniciais as operador_iniciais,
                    r.hora_inicio as desde,
                    COALESCE(r.horimetro_final - r.horimetro_inicial, 0) as horas_hoje,
                    COALESCE((r.horimetro_final - r.horimetro_inicial) * m.taxa_consumo, 0) as fuel_hoje
                 FROM maquinas m
                 LEFT JOIN status_maquina s ON m.status_id = s.id
                 LEFT JOIN categorias_maquina c ON m.categoria_id = c.id
                 LEFT JOIN registros r ON m.id = r.maquina_id AND r.data = CURRENT_DATE
                 LEFT JOIN usuarios u ON r.usuario_id = u.id
                 ORDER BY m.status_id ASC, m.nome ASC";

    $stmtMaq = $db->query($queryMaq);
    $maquinas = $stmtMaq->fetchAll(PDO::FETCH_ASSOC);

    // Retorno do JSON único e limpo
    echo json_encode([
        "stats" => [
            "total" => (int)$stats['total'],
            "em_uso" => (int)$stats['em_uso'],
            "manutencao" => (int)$stats['manutencao'],
            "inativa" => (int)$stats['inativa']
        ],
        "maquinas" => $maquinas
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erro no banco de dados: " . $e->getMessage()]);
}
