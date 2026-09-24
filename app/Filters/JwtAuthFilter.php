<?php

namespace App\Filters;

use App\Libraries\Auth\CurrentUser;
use App\Libraries\Auth\JwtService;
use App\Services\V1\Auth\AuthService;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;

/**
 * Exige "Authorization: Bearer <access_token>" valido (assinatura, iss/aud,
 * nao expirado, typ=access) E sessao ativa: a claim sid precisa conferir com
 * user_manager.token (AuthService::sessionActive) — apos logout ou novo login
 * o access token anterior e recusado na hora, sem esperar o exp. Custo: 1
 * SELECT por requisicao protegida. Usado hoje somente em auth/me — ver
 * Config/Routes/Api/v1/Auth/EndpointAuth.php. Em sucesso, popula CurrentUser
 * para o controller ler.
 */
class JwtAuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $header = $request->getHeaderLine('Authorization');

        if (!preg_match('/^Bearer\s+(.+)$/i', trim($header), $matches)) {
            return $this->unauthorized($request, 'Token de acesso ausente. Envie "Authorization: Bearer <token>".');
        }

        $claims = (new JwtService())->decode($matches[1]);

        if ($claims === null || ($claims['typ'] ?? null) !== 'access') {
            return $this->unauthorized($request, 'Token de acesso invalido ou expirado.');
        }

        if (!(new AuthService())->sessionActive((int) ($claims['sub'] ?? 0), (string) ($claims['sid'] ?? ''))) {
            return $this->unauthorized($request, 'Sessao encerrada. Faca login novamente.');
        }

        CurrentUser::setClaims($claims);

        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Nada a fazer depois da resposta.
    }

    private function unauthorized(RequestInterface $request, string $message): ResponseInterface
    {
        /** @var ResponseInterface $response */
        $response = Services::response();

        return $response->setStatusCode(401)->setJSON([
            'method'     => strtoupper($request->getMethod()),
            'endpoint'   => '/' . ltrim($request->getUri()->getPath(), '/'),
            'statusCode' => 401,
            'message'    => $message,
            'success'    => false,
        ]);
    }
}
