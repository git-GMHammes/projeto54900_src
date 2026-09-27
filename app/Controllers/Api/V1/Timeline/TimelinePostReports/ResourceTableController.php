<?php

namespace App\Controllers\Api\V1\Timeline\TimelinePostReports;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Timeline\TimelinePostReports\CreateRequest;
use App\Requests\V1\Timeline\TimelinePostReports\UpdateRequest;
use App\Services\V1\Timeline\TimelinePostReports\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela timeline_post_reports.
 *
 * Grupo da fila de moderacao: as rotas de leitura/update/exclusao sao adminonly
 * (terceiro argumento da rota); o Processor reconfere no update/delete.
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
        return (new CreateRequest())->rules();
    }

    protected function getUpdateRules(): array
    {
        return (new UpdateRequest())->rules();
    }
}
