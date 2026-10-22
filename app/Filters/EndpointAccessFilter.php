<?php

namespace App\Filters;

use App\Libraries\Auth\CurrentUser;
use App\Services\V1\Audit\AuditLogService;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\EndpointAccess;
use Config\Services;

/**
 * Permissao por endpoint: confere o perfil da sessao (CurrentUser::roleSlug())
 * contra as regras de Config\EndpointAccess. SEMPRE depois de 'jwtauth' (que
 * popula CurrentUser). Rota sem regra passa; admin sempre passa; sessao sem
 * perfil numa rota com regra = 401; perfil fora da lista = 403.
 */
class EndpointAccessFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $path = trim($request->getUri()->getRoutePath(), '/');

        foreach ((new EndpointAccess())->rules as $pattern => $roles) {
            if (!fnmatch($pattern, $path)) {
                continue;
            }

            $role = CurrentUser::roleSlug();

            if ($role === null) {
                return $this->deny($request, 401, 'Sessao nao identificada.');
            }

            if ($role === 'admin' || $role === 'superuser' || in_array($role, $roles, true)) {
                return $request;
            }

            return $this->deny($request, 403, 'Seu perfil nao tem acesso a este recurso.');
        }

        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Nada a fazer depois da resposta.
    }

    private function deny(RequestInterface $request, int $status, string $message): ResponseInterface
    {
        (new AuditLogService())->recordEvent('access_denied', ['status_code' => $status, 'details' => $message]);

        /** @var ResponseInterface $response */
        $response = Services::response();

        return $response->setStatusCode($status)->setJSON([
            'method'     => strtoupper($request->getMethod()),
            'endpoint'   => '/' . ltrim($request->getUri()->getPath(), '/'),
            'statusCode' => $status,
            'message'    => $message,
            'success'    => false,
        ]);
    }
}
