<?php

namespace App\Controllers\Api\V1\Auth;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Libraries\Auth\CurrentUser;
use App\Requests\V1\Auth\ChangePasswordRequest;
use App\Requests\V1\Auth\LoginRequest;
use App\Requests\V1\Auth\RefreshRequest;
use App\Services\V1\Audit\AuditLogService;
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
    private AuditLogService $audit;

    public function initController(
        RequestInterface $request,
        ResponseInterface $response,
        LoggerInterface $logger
    ): void {
        parent::initController($request, $response, $logger);
        $this->service = new AuthService();
        $this->audit   = new AuditLogService();
    }

    /**
     * POST auth/login — { username, password } -> access_token + refresh_token + user.
     * Limitado a 5 tentativas/min por IP de origem (Throttler) contra brute-force.
     */
    public function login(): ResponseInterface
    {
        $ip = $this->request->getIPAddress();

        // md5: IPv6 tem ':' (caractere reservado na chave do cache) e gerava 500
        $username = (string) ($this->getRequestBody()['username'] ?? '');

        if (!service('throttler')->check('auth_login_' . md5($ip), 5, 60)) {
            $this->audit->recordEvent('login_fail', ['login' => $username, 'status_code' => 429, 'details' => 'limite de tentativas por IP (429)']);

            return $this->respondError('Muitas tentativas de login. Aguarde um minuto e tente novamente.', 429);
        }

        $rules = new LoginRequest();
        if (!$this->validate($rules->rules(), $rules->messages())) {
            $this->audit->recordEvent('login_fail', ['login' => $username, 'status_code' => 422, 'details' => 'dados de login invalidos (validacao)']);

            return $this->respondValidationError($this->validator->getErrors());
        }

        $body = $this->getRequestBody();
        $result = $this->service->login(
            (string) $body['username'],
            (string) $body['password'],
            $ip,
            isset($body['company_slug']) ? (string) $body['company_slug'] : null
        );

        if (!$result['success']) {
            $this->audit->recordEvent('login_fail', [
                'user_id'     => $result['user_id'] ?? null,
                'login'       => $username,
                'company_slug' => $body['company_slug'] ?? null,
                'status_code' => $result['code'] ?? 401,
                'details'     => $result['reason'] ?? $result['message'],
            ]);

            return $this->respondError($result['message'], $result['code'] ?? 401);
        }

        $this->audit->recordEvent('login_ok', [
            'user_id'      => $result['data']['user']['id'] ?? null,
            'login'        => $username,
            'company_slug' => $result['data']['company_slug'] ?? null,
            'status_code'  => 200,
        ]);

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
            // Refresh recusado = sessao que nao se renova (vencida, revogada ou ja trocada).
            $hint = $this->audit->hintFromToken((string) $body['refresh_token']);
            $this->audit->recordEvent('session_expired', $hint + [
                'status_code' => $result['code'] ?? 401,
                'details'     => $result['message'] . ' (usuario inferido do token, nao verificado)',
            ]);

            return $this->respondError($result['message'], $result['code'] ?? 401);
        }

        $this->audit->recordEvent('token_refresh', [
            'user_id'      => $result['data']['user']['id'] ?? null,
            'company_slug' => $result['data']['user']['company_slug'] ?? null,
            'status_code'  => 200,
        ]);

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

        $this->audit->recordEvent('logout', [
            'user_id'     => $userId,
            'status_code' => 200,
            'details'     => $userId === null ? 'sem sessao ativa identificada' : null,
        ]);

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

        $result = $this->service->me($userId, CurrentUser::companyId());

        if (!$result['success']) {
            return $this->respondError($result['message'], $result['code'] ?? 404);
        }

        return $this->respondSuccess($result['data'], 'Usuário autenticado');
    }

    /**
     * PUT auth/change-password — { current_password, new_password }. Exige
     * 'jwtauth'; troca a própria senha do usuário autenticado e invalida a
     * sessão atual (token NULL), forçando novo login.
     */
    public function changePassword(): ResponseInterface
    {
        $userId = CurrentUser::id();
        if ($userId === null) {
            return $this->respondError('Usuário não autenticado', 401);
        }

        $rules = new ChangePasswordRequest();
        if (!$this->validate($rules->rules(), $rules->messages())) {
            return $this->respondValidationError($this->validator->getErrors());
        }

        $body = $this->getRequestBody();
        $result = $this->service->changePassword(
            $userId,
            (string) $body['current_password'],
            (string) $body['new_password']
        );

        if (!$result['success']) {
            return $this->respondError($result['message'], $result['code'] ?? 401);
        }

        return $this->respondSuccess(null, 'Senha alterada com sucesso');
    }

    /**
     * PATCH auth/self-block — sem corpo. Exige 'jwtauth'; bloqueia a PROPRIA
     * conta do usuário autenticado (status='blocked'), sempre via
     * CurrentUser::id() — nunca recebe id de fora. Usado pelo frontend quando
     * o usuário insiste em acessar uma rota sem permissão (ver ForbiddenPage).
     */
    public function selfBlock(): ResponseInterface
    {
        $userId = CurrentUser::id();
        if ($userId === null) {
            return $this->respondError('Usuário não autenticado', 401);
        }

        $result = $this->service->selfBlock($userId);

        if (!$result['success']) {
            return $this->respondError($result['message'], $result['code'] ?? 404);
        }

        $this->audit->recordEvent('block', [
            'status_code' => 200,
            'details'     => 'auto-bloqueio (tentativas repetidas de acesso negado)',
        ]);

        return $this->respondSuccess(null, 'Conta bloqueada');
    }
}
