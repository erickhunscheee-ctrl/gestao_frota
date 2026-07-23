<?php

session_start();

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../conexao_db/database.php';
require_once '../../usuario/Usuario.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);

        echo json_encode([
            'success' => false,
            'message' => 'Método não permitido.'
        ]);

        exit;
    }

    $conteudo = file_get_contents('php://input');
    $data = json_decode($conteudo, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'JSON inválido.'
        ]);

        exit;
    }

    $email = trim($data['email'] ?? '');
    $senha = (string) ($data['senha'] ?? '');

    if ($email === '' || $senha === '') {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'E-mail e senha são obrigatórios.'
        ]);

        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'E-mail inválido.'
        ]);

        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    if (!$db instanceof PDO) {
        throw new RuntimeException(
            'A conexão com o banco de dados não foi estabelecida.'
        );
    }

    $userObj = new Usuario($db);
    $auth = $userObj->login($email, $senha);

    if (!$auth) {
        http_response_code(401);

        echo json_encode([
            'success' => false,
            'message' => 'E-mail ou senha incorretos.'
        ]);

        exit;
    }

    session_regenerate_id(true);

    $_SESSION['usuario_id'] = $auth['id'];
    $_SESSION['usuario_nome'] = $auth['nome'];
    $_SESSION['usuario_cargo'] = $auth['cargo'];

    http_response_code(200);

    echo json_encode([
        'success' => true,
        'message' => 'Login realizado com sucesso!',
        'usuario' => [
            'id' => $auth['id'],
            'nome' => $auth['nome'],
            'cargo' => $auth['cargo']
        ]
    ]);
} catch (Throwable $exception) {
    error_log(
        'Erro no login: ' .
        $exception->getMessage() .
        ' | Arquivo: ' .
        $exception->getFile() .
        ' | Linha: ' .
        $exception->getLine()
    );

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Erro interno ao acessar o banco de dados.',
        'debug' => $exception->getMessage()
    ]);
}