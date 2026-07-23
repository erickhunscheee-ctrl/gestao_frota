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

    // 1. Busca todas as obras para a dropdown
    $obrasList = $db->query("SELECT id, codigo, nome, meta_horas, data_inicio, prazo FROM obras ORDER BY status ASC, nome ASC")->fetchAll(PDO::FETCH_ASSOC);

    $obraId = isset($_GET['obra_id']) && is_numeric($_GET['obra_id']) ? (int)$_GET['obra_id'] : null;

    if (!$obraId && count($obrasList) > 0) {
        $obraId = (int)$obrasList[0]['id'];
    }

    $obraAtual = null;
    if ($obraId) {
        $stmtObra = $db->prepare("SELECT * FROM obras WHERE id = :id");
        $stmtObra->execute(['id' => $obraId]);
        $obraAtual = $stmtObra->fetch(PDO::FETCH_ASSOC);
    }

    if (!$obraAtual && count($obrasList) > 0) {
        $obraAtual = $obrasList[0];
        $obraId = (int)$obraAtual['id'];
    }

    // 2. Horas acumuladas realizadas na obra
    $horasRealizadas = 0;
    if ($obraId) {
        $stmtDone = $db->prepare("SELECT COALESCE(SUM(horimetro_final - horimetro_inicial), 0) FROM registros WHERE obra_id = :id");
        $stmtDone->execute(['id' => $obraId]);
        $horasRealizadas = (float)$stmtDone->fetchColumn();
    }

    // 3. Média diária de horas nos últimos 14 dias com registro
    $mediaDiaria = 0;
    if ($obraId) {
        $stmtAvg = $db->prepare("
            SELECT COALESCE(AVG(total_dia), 0) FROM (
                SELECT SUM(horimetro_final - horimetro_inicial) as total_dia
                FROM registros
                WHERE obra_id = :id AND data >= CURRENT_DATE - INTERVAL '14 days'
                GROUP BY data
            ) sub
        ");
        $stmtAvg->execute(['id' => $obraId]);
        $mediaDiaria = (float)$stmtAvg->fetchColumn();
    }

    // Se média diária for 0, usa estimativa fallback baseada no histórico ou 8h
    if ($mediaDiaria <= 0) $mediaDiaria = 8.0;

    // 4. Horas por máquina na obra
    $machineHours = [];
    if ($obraId) {
        $stmtMaq = $db->prepare("
            SELECT m.nome, m.codigo_tag, COALESCE(SUM(r.horimetro_final - r.horimetro_inicial), 0) as horas
            FROM registros r
            JOIN maquinas m ON r.maquina_id = m.id
            WHERE r.obra_id = :id
            GROUP BY m.id, m.nome, m.codigo_tag
            ORDER BY horas DESC
        ");
        $stmtMaq->execute(['id' => $obraId]);
        $machineHours = $stmtMaq->fetchAll(PDO::FETCH_ASSOC);
    }

    // 5. Evolução mensal acumulada
    $monthlyProgress = [];
    if ($obraId) {
        $stmtMonthly = $db->prepare("
            SELECT TO_CHAR(data, 'Mon') as mes, SUM(horimetro_final - horimetro_inicial) as horas
            FROM registros
            WHERE obra_id = :id
            GROUP BY date_trunc('month', data), TO_CHAR(data, 'Mon')
            ORDER BY date_trunc('month', data) ASC
        ");
        $stmtMonthly->execute(['id' => $obraId]);
        $monthlyProgress = $stmtMonthly->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode([
        "obras" => $obrasList,
        "selected_id" => $obraId,
        "obra" => $obraAtual,
        "horas_realizadas" => round($horasRealizadas, 1),
        "media_diaria" => round($mediaDiaria, 1),
        "machine_hours" => $machineHours,
        "monthly_progress" => $monthlyProgress
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => $e->getMessage()]);
}
