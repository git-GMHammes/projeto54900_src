<?php

namespace App\Filters;

use App\Libraries\Auth\JwtService;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Acesso aos grupos api/v1/eleicoes2026-* (somente leitura). Aceita:
 *   1. o token especial das Eleicoes (typ=eleicoes, scope=eleicoes2026), emitido sem login por
 *      GET eleicoes-public/token — sem usuario, sem sessao; ou
 *   2. o acesso de sempre: access token valido (jwtauth) de perfil admin (adminonly).
 * Qualquer outro caso cai nas respostas 401/403 dos filtros originais. O token especial so e aceito aqui:
 * o JwtAuthFilter das demais APIs exige typ=access.
 */
class EleicoesAccessFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        if (preg_match('/^Bearer\s+(.+)$/i', trim($request->getHeaderLine('Authorization')), $m)) {
            $claims = (new JwtService())->decode($m[1]);

            if ($claims !== null && ($claims['typ'] ?? null) === 'eleicoes' && ($claims['scope'] ?? null) === 'eleicoes2026') {
                return $request;
            }
        }

        $denied = (new JwtAuthFilter())->before($request);

        if ($denied instanceof ResponseInterface) {
            return $denied;
        }

        return (new AdminOnlyFilter())->before($request);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Nada a fazer depois da resposta.
    }
}
