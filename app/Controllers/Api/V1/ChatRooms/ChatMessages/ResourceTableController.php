<?php

namespace App\Controllers\Api\V1\ChatRooms\ChatMessages;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\ChatRooms\ChatMessages\CreateRequest;
use App\Requests\V1\ChatRooms\ChatMessages\UpdateRequest;
use App\Services\V1\ChatRooms\ChatMessages\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela chat_messages.
 *
 * Todos os 18 endpoints REST estao em BaseResourceTableController. Este
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
     * GET room/{roomId} — mensagens enviadas da sala (membro ativo ou admin).
     */
    public function room(int $roomId): ResponseInterface
    {
        try {
            $result = $this->processor->listRoom($roomId);

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 403);
            }

            return $this->respondSuccess($result['data']);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
