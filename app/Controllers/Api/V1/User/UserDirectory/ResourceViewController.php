<?php

namespace App\Controllers\Api\V1\User\UserDirectory;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\User\UserDirectory\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso somente leitura sobre a view view_user_directory.
 *
 * Diretório mínimo de usuários (id, um_username, uc_name, uc_email) liberado
 * a qualquer usuário autenticado — grupo api/v1/user-directory-view/* tem
 * filtro jwtauth apenas (sem adminonly, diferente de user-manager-view).
 * Todos os endpoints de leitura estão implementados em
 * BaseResourceViewController. Este controller apenas declara o Processor.
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
