<?php

namespace App\Controllers\Api\V1\Calendar\CalendarEventInvites;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Calendar\CalendarEventInvites\CreateRequest;
use App\Requests\V1\Calendar\CalendarEventInvites\UpdateRequest;
use App\Services\V1\Calendar\CalendarEventInvites\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela calendar_event_invites.
 *
 * Todos os endpoints REST estao em BaseResourceTableController. Este controller
 * declara apenas o Processor, as regras de validacao do modulo e o metodo
 * custom acceptToken (unica rota publica do grupo — sem filtro jwtauth).
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
     * POST /accept-token — rota publica (sem sessao). Body: { "token": "..." }.
     * Convite valido -> adiciona o convidado (mesmo create() ja usado
     * internamente em calendar-event-attendees) e invalida o token.
     */
    public function acceptToken(): ResponseInterface
    {
        try {
            $body  = $this->getJsonBody();
            $token = trim((string) ($body['token'] ?? ''));

            if ($token === '') {
                return $this->respondValidationError(['token' => 'Campo obrigatório']);
            }

            $result = $this->processor->acceptToken($token);

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 400);
            }

            return $this->respondSuccess($result['data'], 'Convite aceito com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
