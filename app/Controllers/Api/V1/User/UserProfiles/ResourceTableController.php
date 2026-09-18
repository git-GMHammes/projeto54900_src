<?php

namespace App\Controllers\Api\V1\User\UserProfiles;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\User\UserProfiles\CreateRequest;
use App\Requests\V1\User\UserProfiles\UpdateRequest;
use App\Services\V1\User\UserProfiles\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operações diretas na tabela user_profiles.
 *
 * Todos os endpoints REST estão implementados em BaseResourceTableController.
 * Este controller declara apenas o Processor e as regras de validação do módulo.
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
