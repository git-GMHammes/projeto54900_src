<?php

namespace App\Controllers\Api\V1\Messages\MessagesManager;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\Messages\MessagesManager\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso somente leitura sobre a view view_messages_manager.
 *
 * Os 9 endpoints de leitura estao em BaseResourceViewController. A restricao
 * de visibilidade (remetente/destinatario/admin) fica no Processor.
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
