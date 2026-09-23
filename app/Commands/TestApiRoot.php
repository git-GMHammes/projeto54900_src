<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

/**
 * Teste nativo (sem PHPUnit/vendor) da rota raiz da API.
 * Faz GET na URL informada (ou http://localhost:54900/ por padrão) e
 * valida HTTP 200 + corpo JSON {"status":"ok"}.
 */
class TestApiRoot extends BaseCommand
{
    protected $group       = 'Testing';
    protected $name        = 'test:api-root';
    protected $usage       = 'test:api-root [<url>]';
    protected $description = 'Testa se a rota raiz da API responde 200 + JSON {"status":"ok"}.';
    protected $arguments   = [
        'url' => 'URL a testar (padrão: http://localhost:54900/)',
    ];

    public function run(array $params)
    {
        $url = $params[0] ?? 'http://localhost:54900/';

        CLI::write('Testando ' . $url . ' ...', 'yellow');

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 5,
        ]);
        $body    = curl_exec($ch);
        $errno   = curl_errno($ch);
        $errmsg  = curl_error($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($errno !== 0 || $body === false) {
            CLI::error('FALHA — não foi possível conectar: ' . $errmsg);

            return EXIT_ERROR;
        }

        $decoded = json_decode($body, true);

        $statusOk = $httpCode === 200;
        $jsonOk   = is_array($decoded) && ($decoded['status'] ?? null) === 'ok';

        if ($statusOk && $jsonOk) {
            CLI::write('PASS — HTTP 200 e JSON {"status":"ok"}', 'green');

            return EXIT_SUCCESS;
        }

        CLI::error(sprintf(
            'FALHA — HTTP %d, corpo recebido: %s',
            $httpCode,
            $body,
        ));

        return EXIT_ERROR;
    }
}
