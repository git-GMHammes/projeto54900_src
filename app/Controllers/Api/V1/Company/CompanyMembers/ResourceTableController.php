<?php

namespace App\Controllers\Api\V1\Company\CompanyMembers;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Requests\V1\Company\CompanyMembers\CreateRequest;
use App\Requests\V1\Company\CompanyMembers\UpdateRequest;
use App\Services\V1\Company\CompanyMembers\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para operacoes diretas na tabela company_members.
 *
 * Os 18 endpoints REST estao em BaseResourceTableController, mais o PUT sync/{companyId}. Este
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
     * PUT sync/{companyId} — adiciona/reativa e remove membros da empresa numa transacao.
     *
     * Corpo: {"add_user_ids": [..], "remove_user_ids": [..]}.
     */
    public function sync(int $companyId): ResponseInterface
    {
        try {
            $body   = $this->getJsonBody();
            $result = $this->processor->sync(
                $companyId,
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
