<?php

namespace App\Controllers\Api\V1\Audit;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\Audit\AuditLogService;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Consulta do log de auditoria (audit_logs) — somente leitura e somente admin: o grupo
 * api/v1/audit-logs recebe 'jwtauth' + 'adminonly' por wildcard em Config/Filters.php.
 *
 * Estende BaseResourceViewController so para reaproveitar os helpers de resposta; as rotas
 * genericas de leitura da base nao sao registradas (mesmo desvio do AuthController).
 */
class AuditLogController extends BaseResourceViewController
{
    private AuditLogService $service;

    public function initController(
        RequestInterface $request,
        ResponseInterface $response,
        LoggerInterface $logger
    ): void {
        parent::initController($request, $response, $logger);
        $this->service = new AuditLogService();
    }

    /**
     * POST audit-logs/find?page=1&limit=20&sort=id&order=desc
     *
     * Body JSON (todos opcionais): user_id, company_id, login, event_type, action, resource,
     * resource_id, ip_origin, http_method, status_code, session_id, date_from, date_to, q.
     */
    public function find(): ResponseInterface
    {
        try {
            $result = $this->service->search($this->extractRequestFilters($this->getJsonBody()), $this->getPaginationParams());

            return $this->respondPaginated($result['data'], $result['pagination']);
        } catch (\InvalidArgumentException $e) {
            return $this->respondValidationError(['filters' => $e->getMessage()]);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    /** GET audit-logs/show/{id} */
    public function show(int $id): ResponseInterface
    {
        try {
            $row = $this->service->find($id);

            return $row === null ? $this->respondNotFound() : $this->respondSuccess($row, 'Registro encontrado');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
