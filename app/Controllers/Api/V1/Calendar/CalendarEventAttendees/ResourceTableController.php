<?php

namespace App\Controllers\Api\V1\Calendar\CalendarEventAttendees;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Calendar\CalendarEventAttendees\CreateRequest;
use App\Requests\V1\Calendar\CalendarEventAttendees\UpdateRequest;
use App\Services\V1\Calendar\CalendarEventAttendees\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela calendar_event_attendees.
 *
 * Todos os endpoints REST estao em BaseResourceTableController. Este controller
 * declara apenas o Processor e as regras de validacao do modulo.
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
     * PUT /respond/{calendar_event_id} — self-service: o usuario logado
     * aceita/recusa o proprio convite (CurrentUser::id(), nao um id de
     * attendee vindo do cliente). Body: { "response_status": "accepted"|"declined"|... }.
     */
    public function respond(int $calendarEventId): ResponseInterface
    {
        try {
            $body           = $this->getJsonBody();
            $responseStatus = trim((string) ($body['response_status'] ?? ''));

            if ($responseStatus === '') {
                return $this->respondValidationError(['response_status' => 'Campo obrigatório']);
            }

            $result = $this->processor->respond($calendarEventId, $responseStatus);

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 400);
            }

            return $this->respondSuccess($result['data'], 'Resposta registrada com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
