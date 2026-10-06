<?php

namespace App\Controllers\Api\V1\Messages\MessagesManager;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Messages\MessagesManager\CreateRequest;
use App\Requests\V1\Messages\MessagesManager\UpdateRequest;
use App\Services\V1\Messages\MessagesManager\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela messages_manager.
 *
 * Os 18 endpoints REST estao em BaseResourceTableController. Este controller
 * declara o Processor, as regras de validacao e as 2 rotas extras do modulo
 * (with/{userId} e read/{userId}).
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

    /**
     * GET with/{userId} — mensagens entre o usuario logado e {userId}.
     */
    public function with(int $userId): ResponseInterface
    {
        try {
            $result = $this->processor->listWith($userId);

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 403);
            }

            return $this->respondSuccess($result['data']);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    /**
     * PATCH read/{userId} — marca como lidas as mensagens recebidas de {userId}.
     */
    public function read(int $userId): ResponseInterface
    {
        try {
            $result = $this->processor->markRead($userId);

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 403);
            }

            return $this->respondSuccess($result['data']);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
