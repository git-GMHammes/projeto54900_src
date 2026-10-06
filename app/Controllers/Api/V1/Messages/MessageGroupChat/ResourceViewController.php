<?php

namespace App\Controllers\Api\V1\Messages\MessageGroupChat;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\Messages\MessageGroupChat\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso somente leitura sobre a view view_message_group_chat_summary.
 *
 * Os 9 endpoints de leitura estao em BaseResourceViewController. O escopo (so as proprias linhas do membro) fica no Processor.
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
