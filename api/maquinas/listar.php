<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

require_once '../../conexao_db/database.php';
require_once '../../maquinas/Maquinas.php';

$database = new Database();
$db = $database->getConnection();
$maqObj = new Maquinas($db);

$stmt = $maqObj->readAll();
$num = $stmt->rowCount();

if ($num > 0) {
    $lista = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($lista, $row);
    }
    http_response_code(200);
    echo json_encode($lista);
} else {
    http_response_code(404);
    echo json_encode(["message" => "Nenhuma máquina encontrada."]);
}