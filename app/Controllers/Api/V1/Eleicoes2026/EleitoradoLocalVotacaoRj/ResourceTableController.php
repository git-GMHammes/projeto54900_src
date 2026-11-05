<?php

namespace App\Controllers\Api\V1\Eleicoes2026\EleitoradoLocalVotacaoRj;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Services\V1\Eleicoes2026\EleitoradoLocalVotacaoRj\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para a tabela eleitorado_local_votacao_2026_RJ — eleitorado por local de votacao 2026 (RJ).
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
