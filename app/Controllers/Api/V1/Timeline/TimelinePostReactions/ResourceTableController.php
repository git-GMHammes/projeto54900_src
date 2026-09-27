<?php

namespace App\Controllers\Api\V1\Timeline\TimelinePostReactions;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Timeline\TimelinePostReactions\CreateRequest;
use App\Requests\V1\Timeline\TimelinePostReactions\UpdateRequest;
use App\Services\V1\Timeline\TimelinePostReactions\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela timeline_post_reactions.
 *
 * Nao ha formulario para esta tabela: like/dislike e acao de um clique pela UI.
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
