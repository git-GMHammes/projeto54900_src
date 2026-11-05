<?php

namespace App\Controllers\Api\V1\Eleicoes2026\DashVotosPartido;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\Eleicoes2026\DashVotosPartido\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso somente leitura sobre a view view_dash_votos_partido — Votos do candidato 22001 por cargo e partido.
 */
class ResourceViewController extends BaseResourceViewController
{
    public function initController(
        RequestInterface $request,
        ResponseInterface $response,
        LoggerInterface $logger
    ): void {
        parent::initController($request, $response, $logger);
        $this->processor = new Processor();
    }
}
