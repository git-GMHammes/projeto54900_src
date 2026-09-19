<?php

namespace App\Controllers\Api\V1\Calendar\CalendarManager;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Calendar\CalendarManager\CreateRequest;
use App\Requests\V1\Calendar\CalendarManager\UpdateRequest;
use App\Services\V1\Calendar\CalendarManager\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela calendar_manager.
 *
 * Todos os endpoints REST estao em BaseResourceTableController. Este controller
 * declara apenas o Processor e as regras de validacao do modulo.
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
