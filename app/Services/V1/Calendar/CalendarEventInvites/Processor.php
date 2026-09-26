<?php

namespace App\Services\V1\Calendar\CalendarEventInvites;

use App\Libraries\Auth\CurrentUser;
use App\Libraries\Mail\MailerService;
use App\Models\V1\Calendar\CalendarEventInvites\SqlTableModel;
use App\Models\V1\Calendar\CalendarEventAttendees\SqlTableModel as AttendeesModel;
use App\Models\V1\Calendar\CalendarEvents\SqlTableModel as CalendarEventsModel;
use App\Models\V1\User\UserManager\SqlTableModel as UserManagerModel;
use App\Models\V1\User\UserProfiles\SqlTableModel as UserProfilesModel;
use App\Services\V1\BaseTableService;
use App\Services\V1\Calendar\CalendarEventAttendees\Processor as AttendeesProcessor;
use App\Services\V1\User\UserManager\Processor as UserManagerProcessor;
use App\Services\V1\User\UserProfiles\Processor as UserProfilesProcessor;

/**
 * Service de negocio do modulo Calendar/CalendarEventInvites.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - no create (organizador, jwtauth): aceita Modo A ({calendar_event_id,
 *    user_manager_id} — convidado ja cadastrado) OU Modo B
 *    ({calendar_event_id, email} — convidado sem conta). Se o e-mail do Modo
 *    B ja pertencer a um usuario existente, resolve transparentemente para o
 *    Modo A (evita conta duplicada, ja que user_profiles.email e UNIQUE).
 *    Bloqueia se o usuario/e-mail ja e attendee do evento, invalida qualquer
 *    convite pendente anterior do mesmo par, gera um token aleatorio de uso
 *    unico (guarda so o hash sha256), grava expiracao (+72h) e envia o
 *    e-mail de convite pela conta no-reply (MailerService).
 *  - acceptToken() (rota publica /accept-token): valida o token. Se o
 *    convite ainda nao tem user_manager_id (Modo B), executa o auto-cadastro
 *    (UserManager\Processor::create() + UserProfiles\Processor::create(),
 *    ambos ja existentes) e envia um segundo e-mail com usuario/senha/link de
 *    login. Depois, chama CalendarEventAttendees\Processor::create() -- o
 *    MESMO metodo que ja adiciona convidados hoje internamente -- para
 *    inserir o attendee. Marca o convite como usado (reset de uso unico). A
 *    partir dai, aceitar/recusar segue o fluxo ja existente (PUT
 *    /calendar-event-attendees/respond/{id}), exigindo login normal.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel      $tableModel;
    private AttendeesModel       $attendeesModel;
    private AttendeesProcessor   $attendeesProcessor;
    private CalendarEventsModel  $eventsModel;
    private UserManagerModel     $usersModel;
    private UserProfilesModel    $profilesModel;
    private UserManagerProcessor  $userManagerProcessor;
    private UserProfilesProcessor $userProfilesProcessor;
    private MailerService        $mailer;

    private const TOKEN_TTL_SECONDS = 72 * 3600;

    /** user_roles.id do papel "Guest" (slug guest) -- convidado auto-cadastrado nunca vira admin/user por engano. */
    private const GUEST_ROLE_ID = 3;

    public function __construct()
    {
        $this->tableModel            = new SqlTableModel();
        $this->attendeesModel        = new AttendeesModel();
        $this->attendeesProcessor    = new AttendeesProcessor();
        $this->eventsModel           = new CalendarEventsModel();
        $this->usersModel            = new UserManagerModel();
        $this->profilesModel         = new UserProfilesModel();
        $this->userManagerProcessor  = new UserManagerProcessor();
        $this->userProfilesProcessor = new UserProfilesProcessor();
        $this->mailer                = new MailerService();
    }

    /**
     * POST /create — gera o token, grava so o hash e envia o e-mail de
     * convite. O token cru so existe em memoria durante esta chamada; nunca e
     * persistido nem retornado na resposta HTTP.
     *
     * Modo A ({user_manager_id}): busca o perfil, exige email/nome
     * cadastrados. Modo B ({email}): se o e-mail ja pertence a um usuario
     * existente, resolve para o Modo A (evita duplicar conta -- email e
     * UNIQUE em user_profiles); senao, segue como convite sem conta
     * (user_manager_id fica null, o nome so existira apos o auto-cadastro).
     */
    public function create(array $data): array
    {
        $eventId  = (int) ($data['calendar_event_id'] ?? 0);
        $userId   = (int) ($data['user_manager_id'] ?? 0);
        $rawEmail = trim((string) ($data['email'] ?? ''));

        if ($userId < 1 && $rawEmail === '') {
            return ['success' => false, 'message' => 'informe user_manager_id ou email', 'code' => 422];
        }

        $resolvedName = null;

        if ($userId > 0) {
            $profile = $this->profilesModel->where('user_manager_id', $userId)->first();
            if (empty($profile['email']) || empty($profile['name'])) {
                return ['success' => false, 'message' => 'usuario sem e-mail ou nome no perfil (user_profiles)', 'code' => 422];
            }
            $resolvedEmail = $profile['email'];
            $resolvedName  = $profile['name'];
        } else {
            $existing = $this->profilesModel->where('email', $rawEmail)->first();
            if ($existing !== null) {
                // E-mail ja cadastrado -- resolve transparentemente para o
                // Modo A em vez de tentar (e falhar) um auto-cadastro depois.
                $userId        = (int) $existing['user_manager_id'];
                $resolvedEmail = $existing['email'];
                $resolvedName  = $existing['name'];
            } else {
                $userId        = 0; // permanece sem conta (Modo B)
                $resolvedEmail = $rawEmail;
            }
        }

        $data['user_manager_id'] = $userId > 0 ? $userId : null;
        $data['email']           = $resolvedEmail;

        $event = $this->eventsModel->find($eventId);

        // Convite pendente anterior do mesmo par fica invalidado -- o
        // reenvio substitui o link antigo em vez de acumular tokens ativos.
        $pending = $userId > 0
            ? $this->tableModel->findPendingByUserInEvent($eventId, $userId)
            : $this->tableModel->findPendingByEmailInEvent($eventId, $resolvedEmail);
        if ($pending !== null) {
            $this->tableModel->markUsed((int) $pending['id']);
        }

        $rawToken = bin2hex(random_bytes(32));

        $data['token_hash'] = hash('sha256', $rawToken);
        $data['expires_at'] = date('Y-m-d H:i:s', time() + self::TOKEN_TTL_SECONDS);
        $data['used_at']    = null;
        $data['created_by'] = (int) CurrentUser::id();

        $result = parent::create($data);

        if ($result['success']) {
            $this->sendInviteEmail($resolvedEmail, $resolvedName, $event['summary'] ?? 'evento', $rawToken);
        }

        return $result;
    }

    /**
     * POST /accept-token (publica) — o convidado que clicou no link do
     * e-mail. Nao exige sessao: o token e que autoriza a entrada na lista de
     * convidados. Reutiliza CalendarEventAttendees\Processor::create() para
     * nao duplicar a logica de "adicionar convidado".
     *
     * @return array{success: bool, data?: array, message?: string, code?: int}
     */
    public function acceptToken(string $rawToken): array
    {
        $invite = $this->tableModel->findValidByTokenHash(hash('sha256', $rawToken));

        if ($invite === null) {
            return ['success' => false, 'message' => 'Convite invalido, expirado ou ja utilizado', 'code' => 404];
        }

        $eventId = (int) $invite['calendar_event_id'];
        $userId  = (int) ($invite['user_manager_id'] ?? 0);
        $accountCreated = false;

        if ($userId < 1) {
            $registration = $this->autoRegisterGuest($invite['email']);
            if (!$registration['success']) {
                return $registration;
            }

            $userId         = $registration['user_manager_id'];
            $accountCreated = true;
            $this->tableModel->update((int) $invite['id'], ['user_manager_id' => $userId]);
            $this->sendCredentialsEmail($invite['email'], $registration['username'], $registration['password']);
        }

        $attendeeResult = $this->attendeesProcessor->create([
            'calendar_event_id' => $eventId,
            'user_manager_id'   => $userId,
            'response_status'   => 'needsAction',
        ]);

        // 409 = usuario ja e convidado deste evento (ex.: aceitou por outro
        // caminho antes de clicar no link) -- idempotente, nao e falha.
        $alreadyAttendee = !$attendeeResult['success'] && (int) ($attendeeResult['code'] ?? 0) === 409;

        if (!$attendeeResult['success'] && !$alreadyAttendee) {
            return $attendeeResult;
        }

        $this->tableModel->markUsed((int) $invite['id']);

        return [
            'success' => true,
            'data'    => [
                'calendar_event_id' => $eventId,
                // true so quando a conta foi criada agora (Modo B) -- o
                // frontend usa isso pra orientar o convidado a checar o
                // e-mail (usuario/senha) antes de ir para o login, em vez de
                // mandar direto pra tela de login como no Modo A.
                'account_created'   => $accountCreated,
            ],
        ];
    }

    private function sendInviteEmail(string $toEmail, ?string $toName, string $eventSummary, string $rawToken): void
    {
        $frontendUrl = rtrim((string) env('APP_FRONTEND_URL', ''), '/');
        $link        = $frontendUrl . '/v1/convite/aceitar?token=' . $rawToken;

        $greeting = $toName !== null ? ('Ola, ' . esc($toName) . '!') : 'Ola!';

        $subject = 'Convite para o evento: ' . $eventSummary;
        $html    = '<p>' . $greeting . '</p>'
            . '<p>Voce foi convidado(a) para o evento <strong>' . esc($eventSummary) . '</strong>.</p>'
            . '<p><a href="' . esc($link) . '">Clique aqui para aceitar o convite</a></p>'
            . '<p>Este link expira em 72 horas e so pode ser usado uma vez.</p>';

        $this->mailer->sendHtml($toEmail, $subject, $html);
    }

    /**
     * 2o e-mail, disparado so quando o accept-token cria a conta na hora
     * (Modo B). Usuario/senha em texto puro, uma unica vez -- a senha inicial
     * e previsivel a partir do e-mail (mesma regra do username); o convidado
     * deveria troca-la apos o primeiro login (/v1/account/security, ja
     * existente, nao forcado automaticamente aqui).
     */
    private function sendCredentialsEmail(string $toEmail, string $username, string $rawPassword): void
    {
        $frontendUrl = rtrim((string) env('APP_FRONTEND_URL', ''), '/');
        $loginLink   = $frontendUrl . '/v1/login';

        $subject = 'Sua conta foi criada';
        $html    = '<p>Ola!</p>'
            . '<p>Criamos uma conta para voce aceitar o convite de evento. Dados de acesso:</p>'
            . '<p>Usuario: <strong>' . esc($username) . '</strong><br>'
            . 'Senha: <strong>' . esc($rawPassword) . '</strong></p>'
            . '<p><a href="' . esc($loginLink) . '">Clique aqui para fazer login</a></p>'
            . '<p>Recomendamos trocar a senha apos o primeiro acesso (menu do usuario &gt; Seguranca).</p>';

        $this->mailer->sendHtml($toEmail, $subject, $html);
    }

    /** Parte local do e-mail (antes do "@"), so [a-z0-9._-], com fallback "guest". */
    private function emailLocalPart(string $email): string
    {
        $at    = strpos($email, '@');
        $local = $at !== false ? substr($email, 0, $at) : $email;
        $local = strtolower((string) preg_replace('/[^a-z0-9._-]/', '', $local));

        return $local !== '' ? $local : 'guest';
    }

    /** $base, ou $base seguido de um sufixo numerico, ate achar um username livre. */
    private function uniqueUsernameFrom(string $base): string
    {
        $username = $base;
        $suffix   = 1;
        while ($this->usersModel->existsByUsername($username)) {
            $username = $base . $suffix;
            $suffix++;
        }

        return $username;
    }

    /**
     * Auto-cadastro do convidado sem conta (Modo B), disparado no
     * accept-token. Reaproveita UserManager\Processor::create() (username +
     * password_hash via bcrypt; status fica no DEFAULT do banco -- 'active';
     * user_role_id fixo em GUEST_ROLE_ID -- papel "Guest", nunca o default
     * generico de um cadastro manual) e UserProfiles\Processor::create()
     * (name fixo "Guest", email do convite).
     *
     * @return array{success: bool, user_manager_id?: int, username?: string, password?: string, message?: string, code?: int}
     */
    private function autoRegisterGuest(string $email): array
    {
        $localPart = $this->emailLocalPart($email);
        $username  = $this->uniqueUsernameFrom($localPart);
        $password  = $localPart;

        $userResult = $this->userManagerProcessor->create([
            'username'      => $username,
            'password_hash' => $password,
            'user_role_id'  => self::GUEST_ROLE_ID,
        ]);

        if (!$userResult['success']) {
            return $userResult;
        }

        $newUserId = (int) $userResult['data']['id'];

        $profileResult = $this->userProfilesProcessor->create([
            'user_manager_id' => $newUserId,
            'email'           => $email,
            'name'            => 'Guest',
        ]);

        if (!$profileResult['success']) {
            return $profileResult;
        }

        return [
            'success'         => true,
            'user_manager_id' => $newUserId,
            'username'        => $username,
            'password'        => $password,
        ];
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $eventId = (int) ($data['calendar_event_id'] ?? 0);
        if ($eventId < 1 || !$this->eventsModel->find($eventId)) {
            return ['success' => false, 'message' => 'calendar_event_id nao encontrado', 'code' => 422];
        }

        $userId = (int) ($data['user_manager_id'] ?? 0);

        // Modo A: usuario ja resolvido (create() so chega aqui com um
        // user_manager_id que ja confirmou existir via profilesModel).
        if ($userId > 0) {
            if ($this->attendeesModel->existsByUserInEvent($eventId, $userId)) {
                return ['success' => false, 'message' => 'usuario ja e convidado deste evento', 'code' => 409];
            }

            return null;
        }

        // Modo B: sem user_manager_id -- so o email (obrigatorio, ja
        // resolvido em create()). Duplicidade e checada pelo email cru, ja
        // que ainda nao existe usuario/attendee vinculado.
        $email = (string) ($data['email'] ?? '');
        if ($email === '') {
            return ['success' => false, 'message' => 'informe user_manager_id ou email', 'code' => 422];
        }

        if ($this->attendeesModel->existsByEmailInEvent($eventId, $email)) {
            return ['success' => false, 'message' => 'email ja convidado deste evento', 'code' => 409];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        return null;
    }

    /** token_hash/used_at/created_by nunca sao mutaveis por update. */
    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['token_hash'], $data['used_at'], $data['created_by']);

        return $data;
    }
}
