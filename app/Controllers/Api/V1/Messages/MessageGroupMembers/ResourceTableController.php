<?php

namespace App\Controllers\Api\V1\Messages\MessageGroupMembers;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Messages\MessageGroupMembers\CreateRequest;
use App\Requests\V1\Messages\MessageGroupMembers\UpdateRequest;
use App\Services\V1\Messages\MessageGroupMembers\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela message_group_members.
 *
 * Os 18 endpoints REST estao em BaseResourceTableController, mais o PUT sync/{groupId}. Este
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
     * PUT sync/{groupId} — adiciona/reativa e remove membros do grupo numa transacao.
     *
     * Corpo: {"add_user_ids": [..], "remove_user_ids": [..]}.
     */
    public function sync(int $groupId): ResponseInterface
    {
        try {
            $body   = $this->getJsonBody();
            $result = $this->processor->sync(
                $groupId,
                is_array($body['add_user_ids'] ?? null) ? $body['add_user_ids'] : [],
                is_array($body['remove_user_ids'] ?? null) ? $body['remove_user_ids'] : []
            );

            if (!$result['success']) {
                return $this->respondError($result['message'], $result['code'] ?? 403);
            }

            return $this->respondSuccess($result['data']);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
