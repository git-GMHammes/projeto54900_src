<?php

namespace App\Controllers\Api\V1\ChatRooms\ChatRoomWarnings;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\ChatRooms\ChatRoomWarnings\CreateRequest;
use App\Requests\V1\ChatRooms\ChatRoomWarnings\UpdateRequest;
use App\Services\V1\ChatRooms\ChatRoomWarnings\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes na tabela chat_room_warnings.
 *
 * Todos os 18 endpoints REST estao em BaseResourceTableController. Modulo
 * inteiro e adminonly (todas as rotas no EndpointTable.php) — nao ha
 * "autor" de uma advertencia, e registro de moderacao.
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
