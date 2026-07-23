<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

require_once '../../conexao_db/database.php';

// 1. Verificação de Segurança: Apenas administradores podem ver todos os registros
if (!isset($_SESSION['usuario_cargo']) || $_SESSION['usuario_cargo'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["message" => "Acesso negado. Apenas administradores podem visualizar esta lista."]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$start = isset($_GET['start']) ? $_GET['start'] : null;
$end = isset($_GET['end']) ? $_GET['end'] : null;

try {
    // 3. Query Principal com JOINs para trazer nomes de usuários e máquinas
    $sql = "SELECT 
                r.*, 
                u.nome as usuario_nome, 
                u.unidade,
                m.nome as maquina_nome, 
                m.codigo_tag, 
                m.taxa_consumo,
                m.localizacao
            FROM registros r
            JOIN usuarios u ON r.usuario_id = u.id
            JOIN maquinas m ON r.maquina_id = m.id";

    // Adiciona filtro de data se o período for informado
    if ($start && $end) {
        $sql .= " WHERE r.data BETWEEN :start AND :end";
    }

    $sql .= " ORDER BY r.data DESC, r.hora_inicio DESC";

    $stmt = $db->prepare($sql);

    if ($start && $end) {
        $stmt->bindParam(':start', $start);
        $stmt->bindParam(':end', $end);
    }

    $stmt->execute();
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Retorna os dados em JSON
    echo json_encode($registros);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erro ao processar registros: " . $e->getMessage()]);
}