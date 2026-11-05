<?php

namespace App\Controllers\Api\V1\Eleicoes2026\DashRankingZona;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\Eleicoes2026\DashRankingZona\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso somente leitura sobre a view view_dash_ranking_zona — Ranking de zonas por votos do candidato 22001 e por cargo.
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
