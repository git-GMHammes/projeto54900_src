<?php

namespace App\Controllers\Api\V1\User\UserManager;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\User\UserManager\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso somente leitura sobre a view view_user_manager.
 *
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
