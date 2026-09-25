<?php

namespace App\Filters;

use App\Libraries\Auth\CurrentUser;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;

/**
 * Exige papel 'admin' (CurrentUser::isAdmin()). SEMPRE roda depois de
 * 'jwtauth' (que valida o token e popula CurrentUser) — sozinho este filtro
 * so autoriza, nao autentica. Usado hoje no modulo user-manager
 * (Config/Routes/Api/v1/User/UserManager/EndpointTable.php e o wildcard
 * api/v1/user-manager-view/* em Config/Filters.php).
 */
class AdminOnlyFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        if (!CurrentUser::isAdmin()) {
            /** @var ResponseInterface $response */
            $response = Services::response();

            return $response->setStatusCode(403)->setJSON([
                'method'     => strtoupper($request->getMethod()),
                'endpoint'   => '/' . ltrim($request->getUri()->getPath(), '/'),
                'statusCode' => 403,
                'message'    => 'Acesso restrito ao perfil administrador.',
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
