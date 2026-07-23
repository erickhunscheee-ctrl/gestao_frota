<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    exit(json_encode(['message' => 'Sessao expirada.']));
}

require_once '../../conexao_db/database.php';

try {
    $db = (new Database())->getConnection();
    $stmt = $db->prepare("SELECT DISTINCT o.id, o.codigo, o.nome, o.status
                          FROM obras o
                          JOIN obra_operadores oo ON oo.obra_id = o.id
                          WHERE oo.usuario_id = :usuario_id AND oo.ativo = TRUE
                            AND o.status IN ('planejada', 'ativa')
                          ORDER BY o.nome");
    $stmt->execute(['usuario_id' => $_SESSION['usuario_id']]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Nao foi possivel carregar as obras vinculadas.']);
}
