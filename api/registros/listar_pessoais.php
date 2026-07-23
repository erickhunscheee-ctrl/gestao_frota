<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

require_once '../../conexao_db/database.php';
require_once '../../registro/Registro.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    exit(json_encode(["message" => "N�o autorizado"]));
}

$database = new Database();
$db = $database->getConnection();
$regObj = new Registro($db);

// Usamos o m�todo que j� criamos na classe Registro
$stmt = $regObj->readByUsuario($_SESSION['usuario_id']);
$num = $stmt->rowCount();

if ($num > 0) {
    $registros = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $hIni = (float)$row['horimetro_inicial'];
    $hFim = (float)$row['horimetro_final'];
    $row['horas_calc'] = $hFim - $hIni;
    
    array_push($registros, $row);
}
    echo json_encode($registros);
} else {
    echo json_encode([]);
}