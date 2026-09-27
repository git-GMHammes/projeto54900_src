<?php

namespace App\Controllers\Api\V1\Timeline\TimelinePostReports;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\Timeline\TimelinePostReports\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso somente leitura sobre a view view_timeline_post_reports.
 *
 * Fila de moderacao: as 9 rotas de leitura sao adminonly (terceiro argumento da
 * rota, em EndPointView.php).
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
