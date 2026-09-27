<?php

namespace App\Controllers\Api\V1\Timeline\TimelinePosts;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\Timeline\TimelinePosts\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso somente leitura sobre a view view_timeline_posts (o feed).
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

    /**
     * GET .../home-feed?seed=&page=&limit=10 — rota extra (fora do contrato
     * canonico de 9 endpoints de view), o feed misto da Home Feed: cotas de
     * publicacoes de hoje/de outros usuarios (aleatorio, seedado por 'seed')
     * + mais curtidas/mais bem avaliadas (ranking). Ver Processor::homeFeed.
     */
    public function homeFeed(): ResponseInterface
    {
        try {
            $seed  = (int) ($this->request->getGet('seed') ?? 0);
            $page  = max(1, (int) ($this->request->getGet('page') ?? 1));
            $limit = min(50, max(1, (int) ($this->request->getGet('limit') ?? 10)));

            $result = $this->processor->homeFeed($seed, $page, $limit);

            return $this->respondPaginated($result['data'], $result['meta'], 'Feed carregado com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
