<?php

namespace App\Services\V1\Messages\MessageGroupMessages;

use App\Libraries\Auth\CurrentUser;
use App\Libraries\ForbiddenWords;
use App\Models\V1\Messages\MessageWarnings\SqlTableModel as WarningsModel;
use App\Models\V1\Messages\MessageGroupMessages\SqlTableModel;
use App\Models\V1\Messages\MessageMentions\SqlTableModel as MentionsModel;
use App\Models\V1\Messages\MessageGroupMessages\SqlViewModel;
use App\Models\V1\Messages\MessagesManager\SqlTableModel as MessagesManagerModel;
use App\Models\V1\User\UserManager\SqlTableModel as UserManagerModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Messages/MessageGroupMessages — mensagem enviada a um grupo.
 *
 * Modelo: messages_manager (recipient NULL) + message_group_messages (UNIQUE mensagem) ->
 * message_groups_manager -> message_group_members. Os destinatarios sao os membros ativos do
 * grupo na hora da leitura (sem copia por membro). O `id` deste recurso e o da LIGACAO.
 * Message NAO e chat. Regras:
 *
 *  - Guest nao cria/edita/exclui (403).
 *  - Create (= enviar ao grupo): grupo existente (404) e `active` (409); o remetente e o
 *    usuario da sessao, ativo, e precisa ser membro ativo do grupo (admin envia a qualquer
 *    grupo). Mensagem e ligacao nascem na MESMA transacao. `scheduled_at` futuro =
 *    `scheduled`; vazio = `sent` com `sent_at` = agora; data passada = 422.
 *  - Update: so o remetente ou admin. AREA ADMINISTRATIVA IRRESTRITA: texto e `scheduled_at`
 *    mudam em qualquer status (a regra "so agendada" e do MODO CHAT, futuro). `status=removed`
 *    cancela/remove. O grupo e imutavel (igual ao gravado e ignorado; diferente = 403). Nada
 *    mudou = 200 sem alterar.
 *  - Exclusao (soft/restore/hard): remetente ou admin; afeta a mensagem e a ligacao juntas.
 *    clear-deleted: so admin.
 *  - Visibilidade (tabela e view): o remetente, o dono do grupo, os membros ativos (so
 *    `sent`) e o admin; fora disso a linha "nao existe" (404 / lista vazia).
 *  - O job `messages:dispatch` envia as agendadas; a leitura por membro fica para outra fase.
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
    // Escrita
    // -------------------------------------------------------------------------

    /** Envia uma mensagem ao grupo: messages_manager + message_group_messages numa transacao. */
    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        // `mentions` (lista de ids de usuario) sai antes da sanitizacao, que nao trata listas.
        $rawMentions = $data['mentions'] ?? null;
        unset($data['mentions']);

        $data        = $this->removeMasks($this->sanitizeData($data));
        $groupId     = (int) ($data['message_groups_manager_id'] ?? 0);
        $content     = trim((string) ($data['content'] ?? ''));
        $scheduledAt = trim((string) ($data['scheduled_at'] ?? ''));
        $me          = (int) CurrentUser::id();

        if ($content === '') {
            return $this->invalid('A mensagem nao pode ficar vazia');
        }

        $sender = $this->usersModel->find($me);
        if ($sender === null || ($sender['status'] ?? null) !== 'active') {
            return $this->forbidden('Somente usuario ativo pode enviar mensagens');
        }

        $group = $this->tableModel->findGroup($groupId);
        if ($group === null) {
            return $this->notFound('Grupo nao encontrado');
        }

        if (!CurrentUser::isAdmin() && !$this->tableModel->isActiveMember($groupId, $me)) {
            // Quem nao pertence ao grupo nem sabe que ele existe.
            return $this->notFound('Grupo nao encontrado');
        }

        if ($group['status'] !== 'active' && !CurrentUser::isAdmin()) { // admin envia tambem a grupo inativo
            return $this->conflict('Grupo inativo nao recebe mensagens');
        }

        // Data passada: so o admin registra (mensagem ja enviada naquela data, como no 1 para 1); os demais recebem 422.
        $isPast = $scheduledAt !== '' && !$this->isFuture($scheduledAt);
        if ($isPast && !CurrentUser::isAdmin()) {
            return $this->invalid('A data de envio precisa ser futura');
        }

        // Marcacoes (@): so membros ativos do grupo e nunca o proprio remetente; ate 20; tudo ou nada.
        $mentions = new MentionsModel();
        $mentionIds = $this->mentionIds($rawMentions);
        if ($mentionIds === null) {
            return $this->invalid('As marcacoes devem ser uma lista de ids de usuario');
        }
        if (count($mentionIds) > 20) {
            return $this->invalid('No maximo 20 marcacoes por mensagem');
        }
        foreach ($mentionIds as $mentionedId) {
            if ($mentionedId === $me) {
                return $this->invalid('Voce nao pode marcar a si mesmo');
            }
            if (!$this->tableModel->isActiveMember($groupId, $mentionedId)) {
                return $this->invalid('So se marca membro ativo do grupo (usuario ' . $mentionedId . ')');
            }
        }

        // Filtro de palavrao (admin isento): a mensagem e gravada `blocked` (nunca entregue, sem marcacoes), gera
        // advertencia e a chamada responde 422.
        $word    = CurrentUser::isAdmin() ? null : ForbiddenWords::first($content);
        $blocked = $word !== null;

        $scheduled = !$blocked && $scheduledAt !== '' && !$isPast;
        $db        = $this->tableModel->db;
        $db->transStart();

        $messageId = $this->tableModel->insertMessage([
            'sender_user_manager_id' => $me,
            'content'                => $content,
            'status'                 => $blocked ? 'blocked' : ($scheduled ? 'scheduled' : 'sent'),
            'scheduled_at'           => ($scheduled || $isPast) ? $scheduledAt : null,
            'sent_at'                => ($scheduled || $blocked) ? null : ($isPast ? $scheduledAt : date('Y-m-d H:i:s')),
        ]);
        $linkId = $messageId > 0 ? $this->tableModel->insertLink($messageId, $groupId) : 0;
        if ($linkId > 0 && !$blocked) {
            foreach ($mentionIds as $mentionedId) {
                $mentions->insertMention($messageId, $mentionedId);
            }
        }

        $db->transComplete();

        if (!$db->transStatus() || $linkId === 0) {
            return ['success' => false, 'message' => 'Erro ao enviar a mensagem ao grupo', 'code' => 500];
        }

        if ($blocked) {
            (new WarningsModel())->register($messageId, $me, $groupId, (string) $word);

            return $this->invalid('Mensagem bloqueada: contem palavra proibida (' . $word . ')');
        }

        return ['success' => true, 'data' => $this->tableModel->find($linkId)];
    }

    // -------------------------------------------------------------------------
    // MODO CHAT — conversa do grupo e leitura por membro (message_group_reads)
    // -------------------------------------------------------------------------

    /**
     * Conversa do grupo para o chat: ate 200 mensagens (as `sent` de todos e as `scheduled` so do
     * usuario), das mais antigas para as mais novas, com autor, `mine`, `read_count` (membros que ja
     * leram) e `readers_total` (membros que deveriam ler, sem o remetente). So membro ativo (404
     * para quem nao e — nem sabe que o grupo existe); guest 403.
     */
    public function chat(int $groupId): array
    {
        $guard = $this->assertChatMember($groupId);
        if ($guard !== null) {
            return $guard;
        }

        $me      = (int) CurrentUser::id();
        $direct  = new MessagesManagerModel();

        // Chat: envia na hora as agendadas vencidas (nao depende do cron do messages:dispatch).
        $direct->dispatchDue();

        $rows        = $this->tableModel->chatMessages($groupId, $me);
        $members     = $this->tableModel->activeMemberIds($groupId);
        $messageIds  = array_map(static fn (array $row): int => (int) $row['id'], $rows);
        $attachments = $direct->attachmentsFor($messageIds);
        $mentions    = (new MentionsModel())->mentionsFor($messageIds);

        $items = array_map(function (array $row) use ($me, $members, $attachments, $mentions): array {
            $sender = (int) $row['sender_user_manager_id'];
            $author = ($row['author_name'] ?? '') !== '' ? (string) $row['author_name'] : (string) ($row['author_username'] ?? '');

            return [
                'id'                     => (int) $row['id'],
                'link_id'                => (int) $row['link_id'],
                'content'                => (string) $row['content'],
                'status'                 => (string) $row['status'],
                'sender_user_manager_id' => $sender,
                'mine'                   => $sender === $me,
                'author'                 => $author,
                'scheduled_at'           => $row['scheduled_at'],
                'sent_at'                => $row['sent_at'],
                'created_at'             => (string) $row['created_at'],
                'read_count'             => (int) $row['read_count'],
                'readers_total'          => max(0, count($members) - (in_array($sender, $members, true) ? 1 : 0)),
                'attachments'            => $attachments[(int) $row['id']] ?? [],
                'mentions'               => $mentions[(int) $row['id']] ?? [],
            ];
        }, array_reverse($rows));

        return ['success' => true, 'data' => ['items' => $items, 'count' => count($items)]];
    }

    /** Marca como lidas as mensagens do grupo ainda nao lidas pelo usuario (idempotente); devolve `marked`. */
    public function chatRead(int $groupId): array
    {
        $guard = $this->assertChatMember($groupId);
        if ($guard !== null) {
            return $guard;
        }

        return ['success' => true, 'data' => ['marked' => $this->tableModel->markGroupRead($groupId, (int) CurrentUser::id())]];
    }

    /** Guest 403; grupo inexistente ou usuario fora do grupo = 404. */
    private function assertChatMember(int $groupId): ?array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        if ($this->tableModel->findGroup($groupId) === null || !$this->tableModel->isActiveMember($groupId, (int) CurrentUser::id())) {
            return $this->notFound('Grupo nao encontrado');
        }

        return null;
    }

    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->guardSender($id);
        if ($guarded['error'] !== null) {
            return $guarded['error'];
        }

        $link     = $guarded['link'];
        $existing = $guarded['message'];
        $incoming = $this->removeMasks($this->sanitizeData($data));

        $sentGroup = (int) ($incoming['message_groups_manager_id'] ?? 0);
        if ($sentGroup > 0 && $sentGroup !== (int) $link['message_groups_manager_id']) {
            return $this->forbidden('O grupo da mensagem nao pode ser alterado');
        }

        if (array_key_exists('content', $incoming) && trim((string) $incoming['content']) !== trim((string) $existing['content']) && !CurrentUser::isAdmin()) {
            $word = ForbiddenWords::first((string) $incoming['content']);
            if ($word !== null) {
                (new WarningsModel())->register((int) $link['messages_manager_id'], (int) CurrentUser::id(), (int) $link['message_groups_manager_id'], $word);

                return $this->invalid('Texto nao alterado: contem palavra proibida (' . $word . ')');
            }
        }

        $changes = [];
        if (array_key_exists('content', $incoming) && trim((string) $incoming['content']) !== trim((string) $existing['content'])) {
            $changes['content'] = trim((string) $incoming['content']);
        }
        if (array_key_exists('scheduled_at', $incoming)) {
            $new = trim((string) $incoming['scheduled_at']);
            $old = $existing['scheduled_at'] === null ? '' : (string) $existing['scheduled_at'];
            if (($new === '' ? null : strtotime($new)) !== ($old === '' ? null : strtotime($old))) {
                $changes['scheduled_at'] = $new === '' ? null : $new;
            }
        }
        if (($incoming['status'] ?? null) === 'removed' && $existing['status'] !== 'removed') {
            $changes['status'] = 'removed';
        }

        if ($changes === []) {
            if (!array_key_exists('content', $incoming) && !array_key_exists('scheduled_at', $incoming) && !array_key_exists('status', $incoming)) {
                return $this->invalid('Informe ao menos um campo para alterar');
            }

            return ['success' => true, 'data' => $this->tableModel->find($id)];
        }

        // Remover/cancelar vale em qualquer status e e a unica mudanca daquela chamada.
        if (($changes['status'] ?? null) === 'removed') {
            $this->tableModel->updateMessage((int) $link['messages_manager_id'], ['status' => 'removed']);

            return ['success' => true, 'data' => $this->tableModel->find($id)];
        }

        $isAdmin = CurrentUser::isAdmin();

        if (array_key_exists('content', $changes) && $changes['content'] === '') {
            return $this->invalid('A mensagem nao pode ficar vazia');
        }

        if (array_key_exists('scheduled_at', $changes)) {
            if ($changes['scheduled_at'] === null && $existing['status'] === 'scheduled') {
                return $this->invalid('Mensagem agendada exige a data de envio');
            }
            // Data futura so e exigida de quem reagenda uma mensagem ainda agendada (nao-admin).
            if ($changes['scheduled_at'] !== null && !$isAdmin && $existing['status'] === 'scheduled' && !$this->isFuture((string) $changes['scheduled_at'])) {
                return $this->invalid('A data de envio precisa ser futura');
            }
        }

        $this->tableModel->updateMessage((int) $link['messages_manager_id'], $changes);

        return ['success' => true, 'data' => $this->tableModel->find($id)];
    }

    public function deleteSoft(int $id): array
    {
        $guarded = $this->guardWrite($id, false);
        if ($guarded['error'] !== null) {
            return $guarded['error'];
        }

        $db = $this->tableModel->db;
        $db->transStart();
        $result = parent::deleteSoft($id);
        if ($result['success'] ?? false) {
            $this->tableModel->softDeleteMessage((int) $guarded['link']['messages_manager_id']);
        }
        $db->transComplete();

        return $db->transStatus() ? $result : ['success' => false, 'message' => 'Erro ao excluir a mensagem', 'code' => 500];
    }

    public function deleteRestore(int $id): array
    {
        $guarded = $this->guardWrite($id, true);
        if ($guarded['error'] !== null) {
            return $guarded['error'];
        }

        $db = $this->tableModel->db;
        $db->transStart();
        $result = parent::deleteRestore($id);
        if ($result['success'] ?? false) {
            $this->tableModel->restoreMessage((int) $guarded['link']['messages_manager_id']);
        }
        $db->transComplete();

        return $db->transStatus() ? $result : ['success' => false, 'message' => 'Erro ao restaurar a mensagem', 'code' => 500];
    }

    public function deleteHard(int $id): array
    {
        $guarded = $this->guardWrite($id, true);
        if ($guarded['error'] !== null) {
            return $guarded['error'];
        }

        // A ligacao sai junto com a mensagem (FK ON DELETE CASCADE).
        $this->tableModel->hardDeleteMessage((int) $guarded['link']['messages_manager_id']);

        return ['success' => true, 'message' => 'Registro excluído permanentemente'];
    }

    public function clearDeleted(?int $id = null): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode limpar registros excluidos');
        }

        $messageIds = $this->tableModel->deletedMessageIds($id);
        foreach ($messageIds as $messageId) {
            $this->tableModel->hardDeleteMessage($messageId);
        }

        return ['affected' => count($messageIds)];
    }

    // -------------------------------------------------------------------------
    // Leitura — Tabela restrita (remetente, dono, membro ativo com `sent`, admin)
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
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView($this->removeMasks($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->viewScope());
    }

    public function getGroupedView(array $multiFilters, array $params): array
    {
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
    // Privados
    // -------------------------------------------------------------------------

    /** Ids de ligacoes visiveis ao usuario da sessao; null = admin (sem restricao). */
    private function visibleIds(): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        return $this->tableModel->findVisibleIds((int) CurrentUser::id());
    }

    /** O usuario da sessao enxerga esta mensagem de grupo? */
    private function canSee(array $link, array $message): bool
    {
        if (CurrentUser::isAdmin()) {
            return true;
        }

        $me = (int) CurrentUser::id();
        if ((int) $message['sender_user_manager_id'] === $me) {
            return true;
        }

        $group = $this->tableModel->findGroup((int) $link['message_groups_manager_id']);
        if ($group !== null && (int) $group['owner_user_manager_id'] === $me) {
            return true;
        }

        return $message['status'] === 'sent' && $this->tableModel->isActiveMember((int) $link['message_groups_manager_id'], $me);
    }

    /** Ligacao fora da regra de visibilidade "nao existe" (404). */
    private function visibleOrNull(?array $link): ?array
    {
        if ($link === null || CurrentUser::isAdmin()) {
            return $link;
        }

        $message = $this->tableModel->findMessage((int) $link['messages_manager_id']);

        return $message !== null && $this->canSee($link, $message) ? $link : null;
    }

    /** Escopo da view: remetente, dono do grupo ou membro ativo (so `sent`). Admin sem escopo. */
    private function viewScope(): \Closure
    {
        if (CurrentUser::isAdmin()) {
            return static function (object $builder): void {};
        }

        $me = (int) CurrentUser::id();

        return static function (object $builder) use ($me): void {
            $builder->groupStart()
                ->where('mm_sender_user_manager_id', $me)
                ->orWhere('mg_owner_user_manager_id', $me)
                ->orWhere("(mm_status = 'sent' AND mgl_message_groups_manager_id IN (SELECT message_groups_manager_id FROM message_group_members WHERE user_manager_id = " . $me . " AND status = 'active' AND deleted_at IS NULL))", null, false)
            ->groupEnd();
        };
    }

    private function visibleViewRowOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        $me = (int) CurrentUser::id();
        if ((int) ($record['mm_sender_user_manager_id'] ?? 0) === $me || (int) ($record['mg_owner_user_manager_id'] ?? 0) === $me) {
            return $record;
        }

        $visible = ($record['mm_status'] ?? null) === 'sent'
            && $this->tableModel->isActiveMember((int) $record['mgl_message_groups_manager_id'], $me);

        return $visible ? $record : null;
    }

    /**
     * Escrita (delete-*): guest 403; carrega a ligacao e exige remetente ou admin.
     *
     * @return array{error: ?array, link: ?array, message: ?array}
     */
    private function guardWrite(int $id, bool $includeDeleted): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return ['error' => $this->forbidden(), 'link' => null, 'message' => null];
        }

        return $this->guardSender($id, $includeDeleted);
    }

    /**
     * Carrega ligacao + mensagem e exige remetente ou admin; quem nem ve a mensagem recebe 404.
     *
     * @return array{error: ?array, link: ?array, message: ?array}
     */
    private function guardSender(int $id, bool $includeDeleted = false): array
    {
        $link    = $this->tableModel->findLink($id);
        $message = $link === null ? null : $this->tableModel->findMessage((int) $link['messages_manager_id']);

        if ($link === null || $message === null || (!$includeDeleted && $link['deleted_at'] !== null)) {
            return ['error' => $this->notFound(), 'link' => null, 'message' => null];
        }

        if (CurrentUser::isAdmin()) {
            return ['error' => null, 'link' => $link, 'message' => $message];
        }

        if (!$this->canSee($link, $message)) {
            return ['error' => $this->notFound(), 'link' => null, 'message' => null];
        }

        if ((int) $message['sender_user_manager_id'] !== (int) CurrentUser::id()) {
            return ['error' => $this->forbidden('Somente o remetente pode alterar ou excluir a mensagem'), 'link' => null, 'message' => null];
        }

        return ['error' => null, 'link' => $link, 'message' => $message];
    }

    /**
     * Normaliza `mentions` para uma lista de ids de usuario unicos. Vazio = []. Null = formato invalido.
     *
     * @return list<int>|null
     */
    private function mentionIds(mixed $raw): ?array
    {
        if ($raw === null || $raw === '' || $raw === []) {
            return [];
        }

        $ids = [];
        foreach ((array) $raw as $value) {
            if (!is_numeric($value) || (int) $value <= 0) {
                return null;
            }
            $ids[(int) $value] = (int) $value;
        }

        return array_values($ids);
    }

    private function isFuture(string $datetime): bool
    {
        $ts = strtotime($datetime);

        return $ts !== false && $ts > time();
    }

    /** Estrutura paginada vazia — usada quando o usuario nao enxerga nenhuma mensagem de grupo. */
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

    private function conflict(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 409];
    }

    private function forbidden(string $message = 'Operacao nao permitida para este usuario'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 403];
    }

    private function notFound(string $message = 'Registro nao encontrado ou foi excluido'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 404];
    }
}
