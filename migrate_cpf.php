<?php
// Script de migração: Adiciona coluna cpf à tabela usuarios se não existir
session_start();
require_once 'conexao_db/database.php';

// Proteção básica
if (!isset($_SESSION['usuario_cargo']) || $_SESSION['usuario_cargo'] !== 'admin') {
    // Para acesso direto de diagnóstico, permite apenas de localhost
    if ($_SERVER['REMOTE_ADDR'] !== '127.0.0.1' && $_SERVER['REMOTE_ADDR'] !== '::1') {
        http_response_code(403);
        exit(json_encode(["error" => "Acesso negado"]));
    }
}

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        echo json_encode(["error" => "Sem conexão com o banco"]);
        exit;
    }

    // Verificar se coluna cpf existe
    $checkStmt = $db->query("SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'cpf'");
    $colExists = $checkStmt->fetch(PDO::FETCH_ASSOC);

    // Pegar todas as colunas para diagnóstico
    $allCols = $db->query("SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios' ORDER BY ordinal_position");
    $columns = $allCols->fetchAll(PDO::FETCH_COLUMN);

    if ($colExists) {
        echo json_encode(["status" => "ok", "message" => "Coluna CPF já existe", "columns" => $columns]);
    } else {
        // Adicionar coluna cpf
        $db->exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cpf VARCHAR(14)");
        echo json_encode(["status" => "migrated", "message" => "Coluna CPF adicionada com sucesso!", "columns" => array_merge($columns, ['cpf'])]);
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
