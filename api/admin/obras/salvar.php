<?php
require_once '_bootstrap.php';

$data = jsonInput();
$id = isset($data->id) ? (int)$data->id : 0;
$codigo = strtoupper((string)nullableString($data->codigo ?? null));
$nome = nullableString($data->nome ?? null);
$statusPermitidos = ['planejada', 'ativa', 'pausada', 'finalizada', 'cancelada'];
$status = nullableString($data->status ?? null) ?? 'planejada';

if (!$nome || !$codigo) {
    http_response_code(400);
    exit(json_encode(['message' => 'Codigo e nome da obra sao obrigatorios.']));
}
if (!in_array($status, $statusPermitidos, true)) {
    http_response_code(400);
    exit(json_encode(['message' => 'Status da obra invalido.']));
}

$params = [
    'codigo' => $codigo,
    'nome' => $nome,
    'cliente' => nullableString($data->cliente ?? null),
    'descricao' => nullableString($data->descricao ?? null),
    'status' => $status,
    'data_inicio' => nullableString($data->data_inicio ?? null),
    'prazo' => nullableString($data->prazo ?? null),
    'data_conclusao' => nullableString($data->data_conclusao ?? null),
    'endereco' => nullableString($data->endereco ?? null),
    'cidade' => nullableString($data->cidade ?? null),
    'estado' => nullableString($data->estado ?? null),
    'latitude' => nullableString($data->latitude ?? null),
    'longitude' => nullableString($data->longitude ?? null),
    'meta_horas' => max(0, (float)($data->meta_horas ?? 0)),
    'orcamento' => max(0, (float)($data->orcamento ?? 0))
];

try {
    if ($id > 0) {
        $params['id'] = $id;
        $sql = "UPDATE obras SET codigo=:codigo, nome=:nome, cliente=:cliente,
                    descricao=:descricao, status=:status, data_inicio=:data_inicio,
                    prazo=:prazo, data_conclusao=:data_conclusao, endereco=:endereco,
                    cidade=:cidade, estado=:estado, latitude=:latitude, longitude=:longitude,
                    meta_horas=:meta_horas, orcamento=:orcamento, atualizado_em=CURRENT_TIMESTAMP
                WHERE id=:id RETURNING id";
    } else {
        $params['criado_por'] = $_SESSION['usuario_id'] ?? null;
        $sql = "INSERT INTO obras
                    (codigo,nome,cliente,descricao,status,data_inicio,prazo,data_conclusao,
                     endereco,cidade,estado,latitude,longitude,meta_horas,orcamento,criado_por)
                VALUES
                    (:codigo,:nome,:cliente,:descricao,:status,:data_inicio,:prazo,:data_conclusao,
                     :endereco,:cidade,:estado,:latitude,:longitude,:meta_horas,:orcamento,:criado_por)
                RETURNING id";
    }
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $savedId = $stmt->fetchColumn();
    if (!$savedId) {
        http_response_code(404);
        exit(json_encode(['message' => 'Obra nao encontrada.']));
    }
    echo json_encode(['message' => $id ? 'Obra atualizada com sucesso.' : 'Obra cadastrada com sucesso.', 'id' => (int)$savedId]);
} catch (PDOException $e) {
    http_response_code($e->getCode() === '23505' ? 409 : 500);
    echo json_encode(['message' => $e->getCode() === '23505' ? 'Ja existe uma obra com esse codigo.' : 'Nao foi possivel salvar a obra.']);
}
