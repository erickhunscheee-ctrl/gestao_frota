<?php
require_once '_bootstrap.php';

$data = jsonInput();
$obraId = (int)($data->obra_id ?? 0);
$operadores = intIds($data->operadores ?? []);
$maquinas = intIds($data->maquinas ?? []);

if ($obraId <= 0) {
    http_response_code(400);
    exit(json_encode(['message' => 'Selecione uma obra valida.']));
}

try {
    $db->beginTransaction();

    $stmt = $db->prepare('UPDATE obra_operadores SET ativo=FALSE WHERE obra_id=:id');
    $stmt->execute(['id' => $obraId]);
    $stmt = $db->prepare("INSERT INTO obra_operadores (obra_id,usuario_id,ativo)
                         VALUES (:obra,:recurso,TRUE)
                         ON CONFLICT (obra_id,usuario_id)
                         DO UPDATE SET ativo=TRUE, data_vinculo=CURRENT_DATE");
    foreach ($operadores as $usuarioId) {
        $stmt->execute(['obra' => $obraId, 'recurso' => $usuarioId]);
    }

    $stmt = $db->prepare('UPDATE obra_maquinas SET ativo=FALSE WHERE obra_id=:id');
    $stmt->execute(['id' => $obraId]);
    $stmt = $db->prepare("INSERT INTO obra_maquinas (obra_id,maquina_id,ativo)
                         VALUES (:obra,:recurso,TRUE)
                         ON CONFLICT (obra_id,maquina_id)
                         DO UPDATE SET ativo=TRUE, data_vinculo=CURRENT_DATE");
    foreach ($maquinas as $maquinaId) {
        $stmt->execute(['obra' => $obraId, 'recurso' => $maquinaId]);
    }

    $db->commit();
    echo json_encode(['message' => 'Recursos vinculados com sucesso.']);
} catch (Throwable $e) {
    if ($db->inTransaction()) $db->rollBack();
    http_response_code(500);
    echo json_encode(['message' => 'Nao foi possivel atualizar os vinculos.']);
}
