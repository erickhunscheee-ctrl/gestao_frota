<?php
// api/auth/check_session.php
session_start();
header("Content-Type: application/json");

if (isset($_SESSION['usuario_id'])) {
    echo json_encode([
        "logged" => true,
        "usuario_id" => $_SESSION['usuario_id'],
        "nome" => $_SESSION['usuario_nome'],
        "cargo" => $_SESSION['usuario_cargo']
    ]);
} else {
    echo json_encode(["logged" => false]);
}