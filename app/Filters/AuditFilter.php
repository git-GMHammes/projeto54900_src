<?php

namespace App\Filters;

use App\Services\V1\Audit\AuditLogService;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Log de auditoria: grava uma linha 'request' (metodo, rota, RAW do corpo, querystring, ID afetado,
 * acao, usuario, IPs, status) para cada chamada de api/v1/*, DEPOIS da resposta — assim o status e o
 * ID criado ja existem. Registrado so no 'after' (Config/Filters.php). Nunca derruba a requisicao:
 * AuditLogService::recordRequest captura qualquer erro de gravacao.
 *
 * Eventos de sessao (login, refresh, logout, sessao expirada, acesso negado, bloqueio) sao gravados
 * pelo proprio AuthController/filtros via AuditLogService::recordEvent e suprimem esta linha.
 */
class AuditFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Nada a fazer antes da requisicao.
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        if ($request instanceof IncomingRequest) {
            (new AuditLogService())->recordRequest($request, $response);
        }
    }
}
