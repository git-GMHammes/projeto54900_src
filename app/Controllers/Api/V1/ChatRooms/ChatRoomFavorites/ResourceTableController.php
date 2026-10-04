<?php

namespace App\Controllers\Api\V1\ChatRooms\ChatRoomFavorites;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\ChatRooms\ChatRoomFavorites\CreateRequest;
use App\Requests\V1\ChatRooms\ChatRoomFavorites\UpdateRequest;
use App\Services\V1\ChatRooms\ChatRoomFavorites\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela chat_room_favorites.
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
     * POST favorite/{roomId} — favorita a sala para o usuário da sessão (limite CHAT_FAVORITES_LIMIT).
     */
    public function favorite(int $roomId): ResponseInterface
    {
        try {
            $result = $this->processor->favorite($roomId);

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 409);
            }

            return $this->respondSuccess($result['data'], 'Sala adicionada aos favoritos');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    /**
     * DELETE unfavorite/{roomId} — remove a sala dos favoritos da sessão.
     */
    public function unfavorite(int $roomId): ResponseInterface
    {
        try {
            $result = $this->processor->unfavorite($roomId);

            return $this->respondSuccess($result['data'], 'Sala removida dos favoritos');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    /**
     * GET mine — favoritos do usuário da sessão e o limite vigente.
     */
    public function mine(): ResponseInterface
    {
        try {
            $result = $this->processor->mine();

            return $this->respondSuccess($result['data']);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
