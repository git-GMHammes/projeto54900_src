<?php

namespace App\Controllers\Api\V1\Calendar\CalendarManager;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\Calendar\CalendarManager\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso somente leitura sobre a view view_calendar_manager.
 *
 * Todos os endpoints de leitura estao implementados em
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
