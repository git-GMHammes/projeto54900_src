<?php

namespace App\Controllers\Api\V1\Timeline\TimelinePosts;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Timeline\TimelinePosts\CreateRequest;
use App\Requests\V1\Timeline\TimelinePosts\UpdateRequest;
use App\Services\V1\Timeline\TimelinePosts\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela timeline_posts.
 *
 * Todos os 18 endpoints REST estao em BaseResourceTableController. O create e o
 * caminho de publicar/republicar: o Processor resolve a timeline do usuario e
 * carimba published_at.
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
