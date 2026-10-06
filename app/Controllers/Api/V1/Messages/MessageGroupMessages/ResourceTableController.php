<?php

namespace App\Controllers\Api\V1\Messages\MessageGroupMessages;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Messages\MessageGroupMessages\CreateRequest;
use App\Requests\V1\Messages\MessageGroupMessages\UpdateRequest;
use App\Services\V1\Messages\MessageGroupMessages\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela message_group_messages.
 *
 * Os 18 endpoints REST estao em BaseResourceTableController. Este
 * controller declara apenas o Processor e as regras de validacao do modulo.
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
     * GET chat/{groupId} — conversa do grupo para o modo chat (so membro ativo).
     */
    public function chat(int $groupId): ResponseInterface
    {
        try {
            $result = $this->processor->chat($groupId);

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 403);
            }

            return $this->respondSuccess($result['data']);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    /**
     * PATCH chat/{groupId}/read — marca como lidas as mensagens do grupo (idempotente).
     */
    public function chatRead(int $groupId): ResponseInterface
    {
        try {
            $result = $this->processor->chatRead($groupId);

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 403);
            }

            return $this->respondSuccess($result['data']);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
