<?php
require_once '_bootstrap.php';

try {
    $sql = "SELECT
                o.*,
                COALESCE(a.horas, 0) AS horas_realizadas,
                COALESCE(a.custo_combustivel, 0) AS custo_combustivel,
                COALESCE(a.custo_mao_obra, 0) AS custo_mao_obra,
                COALESCE(op.total, 0) AS total_operadores,
                COALESCE(maq.total, 0) AS total_maquinas
            FROM obras o
            LEFT JOIN LATERAL (
                SELECT
                    SUM(r.horimetro_final - r.horimetro_inicial) AS horas,
                    SUM((r.horimetro_final - r.horimetro_inicial) * COALESCE(m.taxa_consumo, 0) * 6.50) AS custo_combustivel,
                    SUM((r.horimetro_final - r.horimetro_inicial) * COALESCE(u.custo_hora, 0)) AS custo_mao_obra
                FROM registros r
                LEFT JOIN maquinas m ON m.id = r.maquina_id
                LEFT JOIN usuarios u ON u.id = r.usuario_id
                WHERE r.obra_id = o.id
            ) a ON TRUE
            LEFT JOIN LATERAL (
                SELECT COUNT(*) AS total FROM obra_operadores oo
                WHERE oo.obra_id = o.id AND oo.ativo = TRUE
            ) op ON TRUE
            LEFT JOIN LATERAL (
                SELECT COUNT(*) AS total FROM obra_maquinas om
                WHERE om.obra_id = o.id AND om.ativo = TRUE
            ) maq ON TRUE
            ORDER BY
                CASE o.status WHEN 'ativa' THEN 1 WHEN 'planejada' THEN 2 WHEN 'pausada' THEN 3 ELSE 4 END,
                o.prazo NULLS LAST, o.nome";

    $obras = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);

    $stmtOps = $db->prepare("SELECT u.id, u.nome, u.iniciais, u.cor_avatar, u.cargo,
                                   f.classe AS funcao, oo.data_vinculo
                            FROM obra_operadores oo
                            JOIN usuarios u ON u.id = oo.usuario_id
                            LEFT JOIN funcoes f ON f.id = oo.funcao_id
                            WHERE oo.obra_id = :id AND oo.ativo = TRUE
                            ORDER BY u.nome");
    $stmtMaq = $db->prepare("SELECT m.id, m.nome, m.codigo_tag, m.modelo, m.taxa_consumo,
                                   om.data_vinculo
                            FROM obra_maquinas om
                            JOIN maquinas m ON m.id = om.maquina_id
                            WHERE om.obra_id = :id AND om.ativo = TRUE
                            ORDER BY m.nome");

    foreach ($obras as &$obra) {
        $stmtOps->execute(['id' => $obra['id']]);
        $obra['operadores'] = $stmtOps->fetchAll(PDO::FETCH_ASSOC);
        $stmtMaq->execute(['id' => $obra['id']]);
        $obra['maquinas'] = $stmtMaq->fetchAll(PDO::FETCH_ASSOC);
    }
    unset($obra);

    $stats = [
        'ativas' => 0,
        'finalizadas' => 0,
        'horas' => 0,
        'custo' => 0,
        'operadores' => 0
    ];
    $operadoresUnicos = [];
    foreach ($obras as $obra) {
        if ($obra['status'] === 'ativa') $stats['ativas']++;
        if ($obra['status'] === 'finalizada') $stats['finalizadas']++;
        $stats['horas'] += (float)$obra['horas_realizadas'];
        $stats['custo'] += (float)$obra['custo_combustivel'] + (float)$obra['custo_mao_obra'];
        if (in_array($obra['status'], ['ativa', 'planejada'], true)) {
            foreach ($obra['operadores'] as $op) $operadoresUnicos[$op['id']] = true;
        }
    }
    $stats['operadores'] = count($operadoresUnicos);

    echo json_encode(['stats' => $stats, 'obras' => $obras]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Nao foi possivel listar as obras. Verifique se a migracao foi aplicada.']);
}
