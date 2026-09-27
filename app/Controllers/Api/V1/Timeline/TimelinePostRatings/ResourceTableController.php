<?php

namespace App\Controllers\Api\V1\Timeline\TimelinePostRatings;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Timeline\TimelinePostRatings\CreateRequest;
use App\Requests\V1\Timeline\TimelinePostRatings\UpdateRequest;
use App\Services\V1\Timeline\TimelinePostRatings\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela timeline_post_ratings.
 *
 * Nao ha formulario para esta tabela: a estrela e acao de um clique pela UI.
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
