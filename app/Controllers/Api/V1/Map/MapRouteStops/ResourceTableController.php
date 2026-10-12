<?php

namespace App\Controllers\Api\V1\Map\MapRouteStops;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Map\MapRouteStops\CreateRequest;
use App\Requests\V1\Map\MapRouteStops\UpdateRequest;
use App\Services\V1\Map\MapRouteStops\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela map_route_stops.
 *
 * Todos os 18 endpoints REST estao em BaseResourceTableController.
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
