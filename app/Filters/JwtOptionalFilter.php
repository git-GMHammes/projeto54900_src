<?php

namespace App\Filters;

use App\Libraries\Auth\CurrentUser;
use App\Libraries\Auth\JwtService;
use App\Services\V1\Auth\AuthService;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Rota PUBLICA que reconhece a sessao quando ela existe.
 *
 * Com "Authorization: Bearer <token>" valido (mesmas regras do JwtAuthFilter: assinatura,
 * typ=access, sessao ativa e empresa da sessao valida), popula CurrentUser — a rota passa a
 * respeitar o escopo da empresa. Sem token, ou com token invalido/vencido, segue como requisicao
 * publica anonima (nunca devolve 401): quem nao esta logado continua podendo se cadastrar.
 *
 * Uso: cadastro de usuario (user-manager/create e user-profiles/create), usado tanto pelo
 * visitante quanto pelo admin logado que cadastra gente na propria empresa.
 */
class JwtOptionalFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $header = $request->getHeaderLine('Authorization');

        if (!preg_match('/^Bearer\s+(.+)$/i', trim($header), $matches)) {
            return $request;
        }

        $claims = (new JwtService())->decode($matches[1]);

        if ($claims === null || ($claims['typ'] ?? null) !== 'access') {
            return $request;
        }

        if ((new AuthService())->sessionActive((int) ($claims['sub'] ?? 0), (string) ($claims['sid'] ?? ''), (int) ($claims['cid'] ?? 0))) {
            CurrentUser::setClaims($claims);
        }

        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Nada a fazer depois da resposta.
    }
}
