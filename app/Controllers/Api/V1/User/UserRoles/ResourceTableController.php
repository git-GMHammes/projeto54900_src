<?php

namespace App\Controllers\Api\V1\User\UserRoles;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Services\V1\User\UserRoles\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para leitura da tabela user_roles.
 *
 * Modulo read-only: so as rotas de leitura sao registradas em
 * Config/Routes/Api/v1/User/UserRoles/EndpointTable.php. getCreateRules/
 * getUpdateRules existem so para satisfazer a classe base e retornam [] —
 * nao ha endpoint create/update exposto.
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
