<?php

namespace App\Controllers\Api\V1\Eleicoes2026\EleicoesToken;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Libraries\Auth\JwtService;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Emissao PUBLICA (sem login) do token especial das APIs Eleicoes2026.
 *
 *   GET eleicoes-public/token
 *
 * O token (typ=eleicoes, scope=eleicoes2026) so e aceito pelo filtro eleicoesauth dos grupos eleicoes2026-*
 * (somente leitura); as demais APIs o recusam (401). Estende BaseResourceViewController so para reaproveitar o
 * envelope padrao de resposta, como o RenderController.
 */
class TokenController extends BaseResourceViewController
{
    public function issue(): ResponseInterface
    {
        try {
            $jwt = new JwtService();

            return $this->respondSuccess([
                'access_token' => $jwt->issueEleicoesToken(),
                'token_type'   => 'Bearer',
                'expires_in'   => $jwt->eleicoesTtlSeconds(),
                'scope'        => 'eleicoes2026',
            ], 'Token Eleicoes emitido com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
