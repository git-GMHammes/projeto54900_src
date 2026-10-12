<?php

namespace App\Controllers\Api\V1\User\UserResourceAccess;

use App\Controllers\Api\V1\BaseResourceTableController;
use App\Libraries\Auth\CurrentUser;
use App\Requests\V1\User\UserResourceAccess\CreateRequest;
use App\Requests\V1\User\UserResourceAccess\UpdateRequest;
use App\Services\V1\User\UserResourceAccess\Processor;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Controller de recurso para a tabela user_resource_access.
 *
 * Endpoints REST em BaseResourceTableController. Desvio sancionado: check(),
 * rota propria GET resource-access/check (so 'jwtauth') para o frontend
 * perguntar se o usuario da sessao pode abrir um form ou list.
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
     * GET resource-access/check?type=form|list&id=N  (ou &slug=...)
     */
    public function check(): ResponseInterface
    {
        try {
            $type = (string) $this->request->getGet('type');
            $id   = $this->request->getGet('id');
            $slug = $this->request->getGet('slug');

            if (!in_array($type, ['form', 'list'], true)) {
                return $this->respondValidationError(['type' => 'O parametro type deve ser form ou list']);
            }

            if (($id === null || $id === '') && ($slug === null || $slug === '')) {
                return $this->respondValidationError(['id' => 'Informe id ou slug']);
            }

            $userId = CurrentUser::id();
            if ($userId === null) {
                return $this->respondError('Usuário não autenticado', 401);
            }

            $result = $this->processor->check(
                $userId,
                (string) CurrentUser::roleSlug(),
                $type,
                ($id !== null && $id !== '') ? (int) $id : null,
                ($slug !== null && $slug !== '') ? (string) $slug : null
            );

            return $this->respondSuccess($result, 'Verificação de acesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
