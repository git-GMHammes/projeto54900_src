<?php

namespace App\Controllers\Api\V1\Auth;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Libraries\Auth\CurrentUser;
use App\Requests\V1\Auth\LoginRequest;
use App\Requests\V1\Auth\RefreshRequest;
use App\Services\V1\Auth\AuthService;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Login/refresh/logout/me — unico grupo da API que emite/consome JWT hoje.
 *
 * login, refresh e logout sao publicos (sem filtro — logout identifica a
 * sessao pelo Bearer ou pelo refresh_token); me exige o filtro 'jwtauth' (ver
 * Config/Routes/Api/v1/Auth/EndpointAuth.php) e le o usuario autenticado via
 * CurrentUser, preenchido pelo JwtAuthFilter.
 *
 * Estende BaseResourceViewController so para reaproveitar os helpers de
 * resposta (respondSuccess/respondError/...) e o envelope padrao — as 8 rotas
 * de leitura genericas da base nao sao registradas para este grupo (mesmo
 * desvio ja usado por Meta/DbSchema/SchemaController).
 */
class AuthController extends BaseResourceViewController
{
    private AuthService $service;

    public function initController(
        RequestInterface $request,
        ResponseInterface $response,
        LoggerInterface $logger
    ): void {
        parent::initController($request, $response, $logger);
        $this->service = new AuthService();
    }

    /**
     * POST auth/login — { username, password } -> access_token + refresh_token + user.
     * Limitado a 5 tentativas/min por IP de origem (Throttler) contra brute-force.
     */
    public function login(): ResponseInterface
    {
        $ip = $this->request->getIPAddress();

        if (!service('throttler')->check('auth_login_' . $ip, 5, 60)) {
            return $this->respondError('Muitas tentativas de login. Aguarde um minuto e tente novamente.', 429);
        }

        $rules = new LoginRequest();
        if (!$this->validate($rules->rules(), $rules->messages())) {
            return $this->respondValidationError($this->validator->getErrors());
        }

        $body = $this->getRequestBody();
        $result = $this->service->login((string) $body['username'], (string) $body['password'], $ip);

        if (!$result['success']) {
            return $this->respondError($result['message'], $result['code'] ?? 401);
        }

        return $this->respondSuccess($result['data'], 'Login realizado com sucesso');
    }

    /**
     * POST auth/refresh — { refresh_token } -> novo par de tokens (rotacao).
     */
    public function refresh(): ResponseInterface
    {
        $rules = new RefreshRequest();
        if (!$this->validate($rules->rules(), $rules->messages())) {
            return $this->respondValidationError($this->validator->getErrors());
        }

        $body = $this->getRequestBody();
        $result = $this->service->refresh((string) $body['refresh_token'], $this->request->getIPAddress());

        if (!$result['success']) {
            return $this->respondError($result['message'], $result['code'] ?? 401);
        }

        return $this->respondSuccess($result['data'], 'Token renovado com sucesso');
    }

    /**
     * POST auth/logout — publico (sem 'jwtauth'): identifica a sessao pelo
     * Bearer ou, se o access token ja expirou, pelo { refresh_token } do corpo,
     * e revoga (user_manager.token NULL). Responde 200 sempre — idempotente e
     * sem revelar se o token recebido era valido; o frontend limpa a sessao
     * local de qualquer forma.
     */
    public function logout(): ResponseInterface
    {
        $accessToken = preg_match('/^Bearer\s+(.+)$/i', trim($this->request->getHeaderLine('Authorization')), $m)
            ? $m[1]
            : null;
        $body         = $this->getRequestBody();
        $refreshToken = is_string($body['refresh_token'] ?? null) ? $body['refresh_token'] : null;
        $ip           = $this->request->getIPAddress();

        $userId = $this->service->resolveLogoutUserId($accessToken, $refreshToken);

        if ($userId !== null) {
            $this->service->logout($userId);
            log_message('info', "[auth] logout ok para user_id={$userId} ip={$ip}");
        } else {
            log_message('info', "[auth] logout sem sessao ativa identificada ip={$ip}");
        }

        return $this->respondSuccess(null, 'Logout realizado com sucesso');
    }

    /**
     * GET auth/me — exige Bearer valido; retorna o usuario/perfil autenticado.
     */
    public function me(): ResponseInterface
    {
        $userId = CurrentUser::id();
        if ($userId === null) {
            return $this->respondError('Usuário não autenticado', 401);
        }

        $result = $this->service->me($userId);

        if (!$result['success']) {
            return $this->respondError($result['message'], $result['code'] ?? 404);
        }

        return $this->respondSuccess($result['data'], 'Usuário autenticado');
    }
}
