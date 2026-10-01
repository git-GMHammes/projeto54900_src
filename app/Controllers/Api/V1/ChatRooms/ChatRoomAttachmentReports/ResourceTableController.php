<?php

namespace App\Controllers\Api\V1\ChatRooms\ChatRoomAttachmentReports;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\ChatRooms\ChatRoomAttachmentReports\CreateRequest;
use App\Requests\V1\ChatRooms\ChatRoomAttachmentReports\UpdateRequest;
use App\Services\V1\ChatRooms\ChatRoomAttachmentReports\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes na tabela chat_room_attachment_reports.
 *
 * Todos os 18 endpoints REST estao em BaseResourceTableController. `create`
 * e livre a qualquer usuario logado nao-guest; as demais 17 rotas somam
 * 'adminonly' no EndpointTable.php (fila de moderacao).
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
