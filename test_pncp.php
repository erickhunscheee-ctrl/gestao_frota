<?php
$url = "https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao?uf=RS&pagina=1";
$context = stream_context_create([
    "http" => [
        "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n",
        "timeout" => 10
    ]
]);
$res = @file_get_contents($url, false, $context);
if ($res) {
    echo "SUCCESS\n";
    $data = json_decode($res, true);
    print_r(array_slice($data['data'], 0, 2));
} else {
    echo "FAILED\n";
}
