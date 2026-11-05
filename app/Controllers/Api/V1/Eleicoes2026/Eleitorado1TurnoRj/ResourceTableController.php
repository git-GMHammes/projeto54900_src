<?php

namespace App\Controllers\Api\V1\Eleicoes2026\Eleitorado1TurnoRj;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Services\V1\Eleicoes2026\Eleitorado1TurnoRj\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para a tabela eleitorado_1_turno_2026_RJ — eleitorado do 1o turno 2026 (RJ), por secao eleitoral.
 *
 * Somente leitura: so as rotas de consulta sao registradas. As regras de escrita ficam vazias
 * porque create/update nao tem rota.
 */
class ResourceTableController extends BaseResourceTableController
{
    public function initController(
        RequestInterface $request,
        ResponseInterface $response,
        LoggerInterface $logger
    ): void {
        parent::initController($request, $response, $logger);
        $this->processor = new Processor();
    }

    protected function getCreateRules(): array
    {
        return [];
    }

    protected function getUpdateRules(): array
    {
        return [];
    }
}
