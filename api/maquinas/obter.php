<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    exit(json_encode(["message" => "Não autorizado"]));
}

require_once '../../conexao_db/database.php';

$database = new Database();
$db = $database->getConnection();

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id > 0) {
    $query = "SELECT id, nome, codigo_tag, horimetro_atual FROM maquinas WHERE id = :id LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode($row);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Máquina não encontrada."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ID da máquina inválido."]);
}
