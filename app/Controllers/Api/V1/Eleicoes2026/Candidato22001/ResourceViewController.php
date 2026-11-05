<?php

namespace App\Controllers\Api\V1\Eleicoes2026\Candidato22001;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\Eleicoes2026\Candidato22001\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso somente leitura sobre a view view_eleicoes_2026_22001_22 — votos do candidato 22001.
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
