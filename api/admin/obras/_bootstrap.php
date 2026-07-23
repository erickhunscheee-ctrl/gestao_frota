<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');

require_once '../../../conexao_db/database.php';

if (!isset($_SESSION['usuario_cargo']) || $_SESSION['usuario_cargo'] !== 'admin') {
    http_response_code(403);
    exit(json_encode(['message' => 'Acesso negado.']));
}

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        throw new RuntimeException('Nao foi possivel conectar ao banco de dados.');
    }
} catch (Throwable $e) {
    http_response_code(500);
    exit(json_encode(['message' => 'Falha ao iniciar o modulo de obras.']));
}

function jsonInput(): object
{
    $data = json_decode(file_get_contents('php://input'));
    if (!is_object($data)) {
        http_response_code(400);
        exit(json_encode(['message' => 'JSON invalido.']));
    }
    return $data;
}

function nullableString($value): ?string
{
    if ($value === null) return null;
    $value = trim((string)$value);
    return $value === '' ? null : $value;
}

function intIds($values): array
{
    if (!is_array($values)) return [];
    return array_values(array_unique(array_filter(array_map('intval', $values), fn($id) => $id > 0)));
}
