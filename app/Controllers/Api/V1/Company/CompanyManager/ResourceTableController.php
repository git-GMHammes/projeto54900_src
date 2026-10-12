<?php

namespace App\Controllers\Api\V1\Company\CompanyManager;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Company\CompanyManager\CreateRequest;
use App\Requests\V1\Company\CompanyManager\UpdateRequest;
use App\Services\V1\Company\CompanyManager\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela company_manager.
 *
 * Endpoints REST em BaseResourceTableController; aqui so o Processor e as regras.
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
