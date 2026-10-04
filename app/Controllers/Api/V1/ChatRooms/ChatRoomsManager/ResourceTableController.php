<?php

namespace App\Controllers\Api\V1\ChatRooms\ChatRoomsManager;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\ChatRooms\ChatRoomsManager\CreateRequest;
use App\Requests\V1\ChatRooms\ChatRoomsManager\UpdateRequest;
use App\Services\V1\ChatRooms\ChatRoomsManager\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela chat_rooms_manager.
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
     * POST join/{id} — entrar na sala (membro ativo do usuário da sessão).
     */
    public function join(int $id): ResponseInterface
    {
        try {
            $result = $this->processor->join($id);

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 409);
            }

            return $this->respondSuccess($result['data'], 'Você entrou na sala');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
