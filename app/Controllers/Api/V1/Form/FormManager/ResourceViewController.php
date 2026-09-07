<?php

namespace App\Controllers\Api\V1\Form\FormManager;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\Form\FormManager\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso somente leitura sobre a view view_form_manager.
 *
 * Todos os endpoints de leitura estao em BaseResourceViewController. Este
 * controller apenas declara o Processor (o mesmo do ResourceTableController,
 * que liga tableModel + viewModel).
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
