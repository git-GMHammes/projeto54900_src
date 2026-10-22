<?php

namespace App\Filters;

use App\Libraries\Auth\CurrentUser;
use App\Services\V1\Audit\AuditLogService;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;

/**
 * Exige papel 'superuser' (CurrentUser::isSuperuser()), exclusivo do modulo Empresa:
 * nem admin passa. SEMPRE roda depois de 'jwtauth' (que valida o token e popula
 * CurrentUser) — sozinho este filtro so autoriza, nao autentica. Wildcards
 * api/v1/company-* em Config/Filters.php.
 */
class SuperuserOnlyFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        if (!CurrentUser::isSuperuser()) {
            (new AuditLogService())->recordEvent('access_denied', ['status_code' => 403, 'details' => 'Acesso restrito ao perfil superuser.']);

            /** @var ResponseInterface $response */
            $response = Services::response();

            return $response->setStatusCode(403)->setJSON([
                'method'     => strtoupper($request->getMethod()),
                'endpoint'   => '/' . ltrim($request->getUri()->getPath(), '/'),
                'statusCode' => 403,
                'message'    => 'Acesso restrito ao perfil superuser.',
                'success'    => false,
            ]);
        }

        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Nada a fazer depois da resposta.
    }
}
