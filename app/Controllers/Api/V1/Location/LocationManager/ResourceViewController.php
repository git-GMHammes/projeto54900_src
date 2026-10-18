<?php

namespace App\Controllers\Api\V1\Location\LocationManager;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\Location\LocationManager\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso somente leitura sobre a view view_location_manager.
 *
 * Os 9 endpoints de leitura estao em BaseResourceViewController.
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
