<?php

namespace App\Controllers\Api\V1\Eleicoes2026\Candidato22001;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Services\V1\Eleicoes2026\Candidato22001\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para a tabela eleicoes_2026_votos_1t_2t_22001_RJ — votos do candidato 22001, 1o e 2o turno 2026 (RJ), por secao.
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
