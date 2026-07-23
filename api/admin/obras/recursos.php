<?php
require_once '_bootstrap.php';

$obraId = isset($_GET['obra_id']) ? (int)$_GET['obra_id'] : 0;

try {
    $operadores = $db->query("SELECT id, nome, cargo, iniciais, cor_avatar
                              FROM usuarios WHERE cargo <> 'admin' ORDER BY nome")
                    ->fetchAll(PDO::FETCH_ASSOC);
    $maquinas = $db->query("SELECT id, nome, codigo_tag, modelo, ano, status_id
                            FROM maquinas ORDER BY nome")
                  ->fetchAll(PDO::FETCH_ASSOC);
    $funcoes = $db->query("SELECT id, classe, descricao FROM funcoes WHERE ativo = TRUE ORDER BY classe")
                 ->fetchAll(PDO::FETCH_ASSOC);

    $selecionados = ['operadores' => [], 'maquinas' => []];
    if ($obraId > 0) {
        $stmt = $db->prepare('SELECT usuario_id FROM obra_operadores WHERE obra_id=:id AND ativo=TRUE');
        $stmt->execute(['id' => $obraId]);
        $selecionados['operadores'] = array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
        $stmt = $db->prepare('SELECT maquina_id FROM obra_maquinas WHERE obra_id=:id AND ativo=TRUE');
        $stmt->execute(['id' => $obraId]);
        $selecionados['maquinas'] = array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
    }

    echo json_encode(compact('operadores', 'maquinas', 'funcoes', 'selecionados'));
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Nao foi possivel carregar os recursos.']);
}
