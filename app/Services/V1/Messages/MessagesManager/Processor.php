<?php

namespace App\Services\V1\Messages\MessagesManager;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Messages\MessagesManager\SqlTableModel;
use App\Models\V1\Messages\MessagesManager\SqlViewModel;
use App\Models\V1\User\UserManager\SqlTableModel as UserManagerModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Messages/MessagesManager.
 *
 * Message NAO e chat: uma linha e uma mensagem de um remetente para um
 * destinatario (sem sala, conversa ou thread). Regras (README_modulo_messages.md):
 *
 *  - Guest nao cria/edita/exclui mensagem (403).
 *  - Create: destinatario existente e ativo, diferente do remetente; remetente
 *    ativo. Remetente e sempre o usuario da sessao. Com `scheduled_at` futuro a
 *    mensagem nasce `scheduled` (invisivel ao destinatario); sem ele nasce
 *    `sent` com `sent_at` = agora. `scheduled_at` no passado e recusado (422).
 *  - O job `messages:dispatch` vira `scheduled` -> `sent` quando a hora chega.
 *  - Update/delete-*: so o remetente ou admin. `content`/`scheduled_at` so
 *    enquanto `scheduled` (409 depois de enviada); `status=removed` cancela a
 *    agendada ou remove a enviada.
 *  - Visibilidade (tabela e view): remetente ve tudo que enviou; destinatario
 *    ve so o que ja foi enviado (`sent`); admin ve tudo. Linha fora da regra
 *    "nao existe" (404).
 *  - `read_at` e carimbado pelo destinatario via PATCH read/{userId}.
 *  - clear-deleted e so admin (defesa em profundidade — a rota ja tem adminonly).
 *  - Filtro de palavrao (`blocked`) e integracao futura, como no chat.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private UserManagerModel $usersModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
        $this->usersModel = new UserManagerModel();
    }

    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $senderId    = $this->resolveSenderId($data);
        $recipientId = (int) ($data['recipient_user_manager_id'] ?? 0);
        $status      = (string) ($data['status'] ?? '');

        if ($senderId !== (int) CurrentUser::id() && !CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin envia mensagem em nome de outro usuario');
        }

        $sender = $this->usersModel->find($senderId);
        if ($sender === null) {
            return $this->notFound('Remetente nao encontrado');
        }

        if (($sender['status'] ?? null) !== 'active') {
            return $this->forbidden('Somente usuario ativo pode enviar mensagens');
        }

        if ($recipientId === $senderId) {
            return $this->invalid('Nao e possivel enviar mensagem para si mesmo');
        }

        $recipient = $recipientId > 0 ? $this->usersModel->find($recipientId) : null;
        if ($recipient === null) {
            return $this->notFound('Destinatario nao encontrado');
        }

        if (($recipient['status'] ?? null) !== 'active') {
            return $this->conflict('Destinatario inativo');
        }

        $scheduledAt = (string) ($data['scheduled_at'] ?? '');

        if ($status === 'scheduled' && $scheduledAt === '') {
            return $this->invalid('Status agendada exige a data de envio');
        }

        // Data passada so vale para admin registrando mensagem ja enviada/bloqueada/removida.
        if ($scheduledAt !== '' && !$this->isFuture($scheduledAt)) {
            $backfill = CurrentUser::isAdmin() && in_array($status, ['sent', 'blocked', 'removed'], true);
            if (!$backfill) {
                return $this->invalid('A data de envio precisa ser futura');
            }
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        $requested = (string) ($data['status'] ?? '');
        $scheduled = (string) ($data['scheduled_at'] ?? '');

        $data['sender_user_manager_id'] = $this->resolveSenderId($data);

        if (in_array($requested, ['blocked', 'removed'], true)) {
            $data['status'] = $requested;
        } elseif ($requested === 'scheduled' || ($scheduled !== '' && $this->isFuture($scheduled))) {
            $data['status'] = 'scheduled';
        } else {
            $data['status'] = 'sent';
        }

        $data['scheduled_at'] = $scheduled !== '' ? $scheduled : null;

        if (empty($data['sent_at'])) {
            $data['sent_at'] = $data['status'] === 'sent' ? date('Y-m-d H:i:s') : null;
        }

        if (empty($data['read_at'])) {
            $data['read_at'] = null;
        }

        return $data;
    }

    /** Campos que o update aceita; o resto do corpo e descartado. */
    private const UPDATABLE = [
        'sender_user_manager_id', 'recipient_user_manager_id', 'content',
        'scheduled_at', 'status', 'sent_at', 'read_at',
    ];

    /** Campos que so o admin altera (o sistema ou o destinatario os definem). */
    private const ADMIN_ONLY = ['sender_user_manager_id', 'recipient_user_manager_id', 'sent_at', 'read_at'];

    protected function prepareUpdateData(int $id, array $data): array
    {
        return array_intersect_key($data, array_flip(self::UPDATABLE));
    }

    /** Remetente do create: o do corpo (so admin pode diferir da sessao) ou o usuario da sessao. */
    private function resolveSenderId(array $data): int
    {
        $sent = (int) ($data['sender_user_manager_id'] ?? 0);

        return $sent > 0 ? $sent : (int) CurrentUser::id();
    }

    // -------------------------------------------------------------------------
    // Escrita — remetente ou admin
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        return parent::create($data);
    }

    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertSenderOrAdmin($id);
        if ($guarded !== null) {
            return $guarded;
        }

        $existing = $this->tableModel->find($id);
        if ($existing === null) {
            return $this->notFound();
        }

        // O formulario manda todas as colunas: so conta o que mudou de verdade.
        $incoming = array_intersect_key($this->sanitizeData($data), array_flip(self::UPDATABLE));
        if ($incoming === []) {
            return $this->invalid('Informe ao menos um campo para alterar');
        }

        $changes = [];
        foreach ($incoming as $field => $value) {
            if ($this->differs((string) $field, $value, $existing)) {
                $changes[$field] = $value;
            }
        }

        if ($changes === []) {
            return ['success' => true, 'data' => $existing];
        }

        $isAdmin = CurrentUser::isAdmin();

        // Remover/cancelar vale em qualquer status e e a unica mudanca daquela chamada.
        if (($changes['status'] ?? null) === 'removed') {
            return parent::update($id, ['status' => 'removed']);
        }

        foreach (self::ADMIN_ONLY as $field) {
            if (array_key_exists($field, $changes) && !$isAdmin) {
                return $this->forbidden('Somente admin altera ' . $field);
            }
        }

        if (array_key_exists('status', $changes) && !$isAdmin) {
            return $this->forbidden('Somente admin altera o status (exceto remover)');
        }

        if ((array_key_exists('content', $changes) || array_key_exists('scheduled_at', $changes))
            && !$isAdmin && ($existing['status'] ?? null) !== 'scheduled') {
            return $this->conflict('Mensagem ja enviada nao pode ser alterada');
        }

        if (array_key_exists('content', $changes)) {
            $content = trim((string) $changes['content']);
            if ($content === '') {
                return $this->invalid('A mensagem nao pode ficar vazia');
            }
            $changes['content'] = $content;
        }

        if (array_key_exists('scheduled_at', $changes) && !$isAdmin && !$this->isFuture((string) $changes['scheduled_at'])) {
            return $this->invalid('A data de envio precisa ser futura');
        }

        $senderId    = (int) ($changes['sender_user_manager_id'] ?? $existing['sender_user_manager_id']);
        $recipientId = (int) ($changes['recipient_user_manager_id'] ?? $existing['recipient_user_manager_id']);

        foreach (['sender_user_manager_id' => 'Remetente', 'recipient_user_manager_id' => 'Destinatario'] as $field => $label) {
            if (!array_key_exists($field, $changes)) {
                continue;
            }
            $user = $this->usersModel->find((int) $changes[$field]);
            if ($user === null) {
                return $this->notFound($label . ' nao encontrado');
            }
            if (($user['status'] ?? null) !== 'active') {
                return $this->conflict($label . ' inativo');
            }
        }

        if ($senderId === $recipientId) {
            return $this->invalid('Nao e possivel enviar mensagem para si mesmo');
        }

        $finalStatus    = (string) ($changes['status'] ?? $existing['status']);
        $finalScheduled = array_key_exists('scheduled_at', $changes) ? $changes['scheduled_at'] : ($existing['scheduled_at'] ?? null);
        if ($finalStatus === 'scheduled' && empty($finalScheduled)) {
            return $this->invalid('Status agendada exige a data de envio');
        }

        return parent::update($id, $changes);
    }

    /** O valor recebido difere do gravado? Datas comparam o instante; ids, o inteiro; texto, aparado. */
    private function differs(string $field, mixed $value, array $existing): bool
    {
        $current = $existing[$field] ?? null;

        if (in_array($field, ['scheduled_at', 'sent_at', 'read_at'], true)) {
            $a = $current === null || $current === '' ? null : strtotime((string) $current);
            $b = $value === null || $value === '' ? null : strtotime((string) $value);

            return $a !== $b;
        }

        if (in_array($field, ['sender_user_manager_id', 'recipient_user_manager_id'], true)) {
            return (int) $current !== (int) $value;
        }

        return trim((string) $current) !== trim((string) $value);
    }

    public function deleteSoft(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertSenderOrAdmin($id);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertSenderOrAdmin($id, true);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertSenderOrAdmin($id, true);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode limpar registros excluidos');
        }

        return parent::clearDeleted($id);
    }

    // -------------------------------------------------------------------------
    // Leitura — Tabela restrita a remetente/destinatario/admin
    // -------------------------------------------------------------------------

    public function find(array $filters, array $params): array
    {
        $ids = $this->visibleIds();
        if ($ids !== null && empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findPaginated($this->removeMasks($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    public function getGrouped(array $multiFilters, array $params): array
    {
        $ids = $this->visibleIds();
        if ($ids !== null) {
            if (empty($ids)) {
                return $this->emptyPaginated($params);
            }
            $multiFilters['id'] = $ids;
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findGrouped($this->removeMasks($multiFilters), $p['page'], $p['limit'], $p['sort'], $p['order']);
    }

    public function search(string $term, array $params): array
    {
        $ids = $this->visibleIds();
        if ($ids !== null && empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->searchByTerm($term, $this->tableModel->searchFields, $p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    public function get(int $id): ?array
    {
        return $this->visibleOrNull(parent::get($id));
    }

    public function getAll(array $params): array
    {
        $ids = $this->visibleIds();
        if ($ids !== null && empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findPaginated([], $p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    public function getNoPagination(string $sort, string $order, ?int $limit = null): array
    {
        $ids = $this->visibleIds();
        if ($ids !== null && empty($ids)) {
            return [];
        }

        return $this->tableModel->getOrdered($sort, $order, $limit, $ids);
    }

    public function getDeleted(int $id): ?array
    {
        return $this->visibleOrNull(parent::getDeleted($id));
    }

    public function getWithDeleted(int $id): ?array
    {
        return $this->visibleOrNull(parent::getWithDeleted($id));
    }

    public function getDeletedAll(array $params): array
    {
        $ids = $this->visibleIds();
        if ($ids !== null && empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findDeletedPaginated($p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    public function getAllWithDeleted(?int $id, array $params): mixed
    {
        if ($id !== null) {
            return $this->visibleOrNull($this->tableModel->findWithDeleted($id));
        }

        $ids = $this->visibleIds();
        if ($ids !== null && empty($ids)) {
            return $this->emptyPaginated($params);
        }

        $p = $this->buildPaginationParams($params);

        return $this->tableModel->findAllWithDeletedPaginated($p['page'], $p['limit'], $p['sort'], $p['order'], $ids);
    }

    // -------------------------------------------------------------------------
    // Leitura — View restrita (mesma regra, via Closure de escopo)
    // -------------------------------------------------------------------------

    public function findView(array $filters, array $params): array
    {
        unset($filters['mm_sender_user_manager_id'], $filters['mm_recipient_user_manager_id']);
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView($this->removeMasks($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->viewScope());
    }

    public function getGroupedView(array $multiFilters, array $params): array
    {
        unset($multiFilters['mm_sender_user_manager_id'], $multiFilters['mm_recipient_user_manager_id']);
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findGroupedView($this->removeMasks($multiFilters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->viewScope());
    }

    public function searchView(string $term, array $params, array $filters = []): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->searchByTermView($term, $p['page'], $p['limit'], $p['sort'], $p['order'], $filters, $this->viewScope());
    }

    public function getView(int $id): ?array
    {
        return $this->visibleViewRowOrNull($this->viewModel->findById($id));
    }

    public function getAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView([], $p['page'], $p['limit'], $p['sort'], $p['order'], $this->viewScope());
    }

    public function getNoPaginationView(string $sort, string $order, ?int $limit = null): array
    {
        return $this->viewModel->findAllView($sort, $order, $limit, $this->viewScope());
    }

    public function getDeletedView(int $id): ?array
    {
        return $this->visibleViewRowOrNull($this->viewModel->findDeletedById($id));
    }

    public function getDeletedAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->viewScope());
    }

    public function getAllWithDeletedView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findAllWithDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->viewScope());
    }

    // -------------------------------------------------------------------------
    // Rotas extras — conversa privada e leitura
    // -------------------------------------------------------------------------

    /**
     * Mensagens entre o usuario logado e $userId, mais antigas primeiro
     * (ultimas 200). As agendadas do proprio usuario aparecem com
     * status=scheduled; as do outro so depois de enviadas.
     */
    public function listWith(int $userId): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $me    = (int) CurrentUser::id();
        $other = $this->usersModel->find($userId);

        if ($other === null || $userId === $me) {
            return $this->notFound('Usuario nao encontrado');
        }

        $rows = $this->viewModel
            ->groupStart()
                ->groupStart()
                    ->where('mm_sender_user_manager_id', $me)
                    ->where('mm_recipient_user_manager_id', $userId)
                    ->whereIn('mm_status', ['scheduled', 'sent'])
                ->groupEnd()
                ->orGroupStart()
                    ->where('mm_sender_user_manager_id', $userId)
                    ->where('mm_recipient_user_manager_id', $me)
                    ->where('mm_status', 'sent')
                ->groupEnd()
            ->groupEnd()
            ->where('deleted_at', null)
            ->orderBy('id', 'DESC')
            ->findAll(200);

        $items = array_map(static fn ($row) => [
            'id'                        => (int) $row['id'],
            'content'                   => (string) ($row['mm_content'] ?? ''),
            'status'                    => (string) ($row['mm_status'] ?? ''),
            'sender_user_manager_id'    => (int) ($row['mm_sender_user_manager_id'] ?? 0),
            'recipient_user_manager_id' => (int) ($row['mm_recipient_user_manager_id'] ?? 0),
            'mine'                      => (int) ($row['mm_sender_user_manager_id'] ?? 0) === $me,
            'author'                    => (string) (($row['sc_name'] ?? '') !== '' ? $row['sc_name'] : ($row['sm_username'] ?? '')),
            'scheduled_at'              => $row['mm_scheduled_at'] ?? null,
            'sent_at'                   => $row['mm_sent_at'] ?? null,
            'read_at'                   => $row['mm_read_at'] ?? null,
            'created_at'                => (string) ($row['created_at'] ?? ''),
        ], array_reverse($rows));

        return ['success' => true, 'data' => ['items' => $items, 'count' => count($items)]];
    }

    /**
     * Destinatario abriu a conversa com $userId: carimba read_at nas mensagens
     * enviadas por ele ainda nao lidas.
     */
    public function markRead(int $userId): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $me = (int) CurrentUser::id();

        if ($userId === $me || $this->usersModel->find($userId) === null) {
            return $this->notFound('Usuario nao encontrado');
        }

        $marked = $this->tableModel->markRead($userId, $me);

        return ['success' => true, 'data' => ['marked' => $marked]];
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    /** Ids visiveis ao usuario da sessao; null = admin (sem restricao). */
    private function visibleIds(): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        return $this->tableModel->findVisibleIds((int) CurrentUser::id());
    }

    /** Linha da tabela fora da regra de visibilidade "nao existe" (404). */
    private function visibleOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        return $this->canSee($record) ? $record : null;
    }

    private function canSee(array $record): bool
    {
        $me = (int) CurrentUser::id();

        if ((int) ($record['sender_user_manager_id'] ?? 0) === $me) {
            return true;
        }

        return (int) ($record['recipient_user_manager_id'] ?? 0) === $me
            && ($record['status'] ?? null) === 'sent';
    }

    /** Escopo da view: remetente (qualquer status) ou destinatario (so sent). Admin sem escopo. */
    private function viewScope(): \Closure
    {
        if (CurrentUser::isAdmin()) {
            return static function (object $builder): void {};
        }

        $me = (int) CurrentUser::id();

        return static function (object $builder) use ($me): void {
            $builder->groupStart()
                ->where('mm_sender_user_manager_id', $me)
                ->orGroupStart()
                    ->where('mm_recipient_user_manager_id', $me)
                    ->where('mm_status', 'sent')
                ->groupEnd()
            ->groupEnd();
        };
    }

    private function visibleViewRowOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        $me = (int) CurrentUser::id();

        if ((int) ($record['mm_sender_user_manager_id'] ?? 0) === $me) {
            return $record;
        }

        $isRecipient = (int) ($record['mm_recipient_user_manager_id'] ?? 0) === $me
            && ($record['mm_status'] ?? null) === 'sent';

        return $isRecipient ? $record : null;
    }

    /** Escrita: so o remetente ou admin; quem nem enxerga a mensagem recebe 404. */
    private function assertSenderOrAdmin(int $id, bool $includeDeleted = false): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        $existing = $includeDeleted
            ? $this->tableModel->findWithDeleted($id)
            : $this->tableModel->find($id);

        if ($existing === null || !$this->canSee($existing)) {
            return $this->notFound();
        }

        if ((int) ($existing['sender_user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
            return $this->forbidden('Somente o remetente pode alterar ou excluir a mensagem');
        }

        return null;
    }

    private function isFuture(string $datetime): bool
    {
        $ts = strtotime($datetime);

        return $ts !== false && $ts > time();
    }

    /** Estrutura paginada vazia — usada quando o usuario nao tem nenhuma mensagem visivel. */
    private function emptyPaginated(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return [
            'data'       => [],
            'pagination' => ['page' => $p['page'], 'limit' => $p['limit'], 'total' => 0, 'pages' => 0],
        ];
    }

    private function invalid(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 422];
    }

    private function forbidden(string $message = 'Operacao nao permitida para este usuario'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 403];
    }

    private function notFound(string $message = 'Registro nao encontrado ou foi excluido'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 404];
    }

    private function conflict(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 409];
    }
}
