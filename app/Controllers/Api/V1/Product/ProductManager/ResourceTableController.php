<?php

namespace App\Controllers\Api\V1\Product\ProductManager;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Product\ProductManager\CreateRequest;
use App\Requests\V1\Product\ProductManager\UpdateRequest;
use App\Services\V1\Product\ProductManager\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela do recurso ProductManager.
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
