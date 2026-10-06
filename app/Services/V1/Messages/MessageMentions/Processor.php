<?php

namespace App\Services\V1\Messages\MessageMentions;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Messages\MessageMentions\SqlTableModel;
use App\Models\V1\Messages\MessageMentions\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Messages/MessageMentions — marcacao de usuario (@) numa mensagem de GRUPO
 * (message_mentions). Message NAO e chat de sala. Regras:
 *
 *  - Guest nao escreve (403).
 *  - Create: so o REMETENTE da mensagem ou admin marca (outro: 403; quem nem ve = 404). A mensagem precisa
 *    ser de GRUPO e nao excluida (404). O marcado precisa ser usuario ativo, MEMBRO ATIVO do grupo da mensagem
 *    e diferente do remetente (422); no maximo 20 por mensagem (422). IDEMPOTENTE: marcar de novo devolve a existente; uma
 *    soft-deletada e reativada.
 *  - Update (troca o marcado, mesmas regras) e clear-deleted: so admin (403).
 *  - delete-soft/restore/hard: o remetente da mensagem ou admin (desfazer a marcacao).
 *  - Visibilidade (tabela e view): as marcacoes em que o usuario foi marcado, as das mensagens que ele enviou,
 *    as dos grupos que ele criou e admin; fora disso "nao existe" (404 / lista vazia). No modo chat as marcacoes
 *    chegam pela propria conversa do grupo (message-group-messages/chat/{groupId}).
 */
class Processor extends BaseTableService
{
    /** Teto de marcacoes por mensagem. */
    public const MAX_PER_MESSAGE = 20;

    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $data      = $this->removeMasks($this->sanitizeData($data));
        $messageId = (int) ($data['messages_manager_id'] ?? 0);
        $userId    = (int) ($data['user_manager_id'] ?? 0);

        $guard = $this->assertCanMark($messageId, $userId);
        if ($guard['error'] !== null) {
            return $guard['error'];
        }

        $existing = $this->tableModel->findPair($messageId, $userId);
        if ($existing !== null) {
            if ($existing['deleted_at'] !== null) {
                $this->tableModel->reactivate((int) $existing['id']);
            }

            return ['success' => true, 'data' => $this->tableModel->find((int) $existing['id'])];
        }

        if ($this->tableModel->countForMessage($messageId) >= self::MAX_PER_MESSAGE && !CurrentUser::isAdmin()) { // sem teto para o admin
            return $this->invalid('No maximo ' . self::MAX_PER_MESSAGE . ' marcacoes por mensagem');
        }

        $id = $this->tableModel->insertMention($messageId, $userId);
        if ($id === 0) {
            return ['success' => false, 'message' => 'Erro ao registrar a marcacao', 'code' => 500];
        }

        return ['success' => true, 'data' => $this->tableModel->find($id)];
    }

    /** Troca o usuario marcado (so admin; mesmas regras do create). */
    public function update(int $id, array $data): array
    {
        $guard = $this->adminOnly();
        if ($guard !== null) {
            return $guard;
        }

        $row = $this->tableModel->find($id);
        if ($row === null) {
            return $this->notFound();
        }

        $userId  = (int) ($data['user_manager_id'] ?? 0);
        $checked = $this->assertCanMark((int) $row['messages_manager_id'], $userId);
        if ($checked['error'] !== null) {
            return $checked['error'];
        }

        if ($this->tableModel->findPair((int) $row['messages_manager_id'], $userId) !== null && $userId !== (int) $row['user_manager_id']) {
            return ['success' => false, 'message' => 'Este usuario ja esta marcado na mensagem', 'code' => 409];
        }

        return parent::update($id, ['user_manager_id' => $userId]);
    }

    public function deleteSoft(int $id): array
    {
        return $this->guardRow($id, false) ?? parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        return $this->guardRow($id, true) ?? parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        return $this->guardRow($id, true) ?? parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        return $this->adminOnly() ?? parent::clearDeleted($id);
    }

    /**
     * Valida uma marcacao (mensagem de grupo, remetente/admin, marcado ativo e membro, nunca o remetente).
     *
     * @return array{error: ?array, message: ?array}
     */
    private function assertCanMark(int $messageId, int $userId): array
    {
        $message = $this->tableModel->findGroupMessage($messageId);
        if ($message === null) {
            return ['error' => $this->notFound('Mensagem de grupo nao encontrada'), 'message' => null];
        }

        $me = (int) CurrentUser::id();
        if (!CurrentUser::isAdmin() && (int) $message['sender_id'] !== $me) {
            $sees = $this->tableModel->isActiveMember((int) $message['group_id'], $me) && $message['status'] === 'sent';

            return ['error' => $sees ? $this->forbidden('Somente o remetente da mensagem marca usuarios') : $this->notFound('Mensagem de grupo nao encontrada'), 'message' => null];
        }

        if ($userId <= 0 || !$this->tableModel->isActiveUser($userId)) {
            return ['error' => $this->notFound('Usuario nao encontrado'), 'message' => null];
        }

        if ($userId === (int) $message['sender_id'] && !CurrentUser::isAdmin()) { // admin pode marcar qualquer membro
            return ['error' => $this->invalid('O remetente nao pode marcar a si mesmo'), 'message' => null];
        }

        if (!$this->tableModel->isActiveMember((int) $message['group_id'], $userId)) {
            return ['error' => $this->invalid('So se marca membro ativo do grupo da mensagem'), 'message' => null];
        }

        return ['error' => null, 'message' => $message];
    }

    /** delete-*: guest 403; admin livre; senao so o remetente da mensagem (quem nem ve = 404). */
    private function guardRow(int $id, bool $includeDeleted): ?array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        if (CurrentUser::isAdmin()) {
            return null;
        }

        $row = $includeDeleted ? $this->tableModel->findWithDeleted($id) : $this->tableModel->find($id);
        if ($row === null) {
            return $this->notFound();
        }

        $message = $this->tableModel->findGroupMessage((int) $row['messages_manager_id']);
        if ($message === null) {
            return $this->notFound();
        }

        if ((int) $message['sender_id'] !== (int) CurrentUser::id()) {
            return (int) $row['user_manager_id'] === (int) CurrentUser::id()
                ? $this->forbidden('Somente o remetente da mensagem desfaz marcacoes')
                : $this->notFound();
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Leitura — Tabela restrita
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

    /** Ids de marcacoes visiveis ao usuario da sessao; null = admin (sem restricao). */
    private function visibleIds(): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        return $this->tableModel->findVisibleIds((int) CurrentUser::id());
    }

    /** A marcacao (linha da tabela) e visivel ao usuario da sessao? */
    private function visibleOrNull(?array $row): ?array
    {
        if ($row === null || CurrentUser::isAdmin()) {
            return $row;
        }

        $ids = $this->tableModel->findVisibleIds((int) CurrentUser::id());

        return in_array((int) $row['id'], $ids, true) ? $row : null;
    }

    /** Escopo da view: marcacoes em que fui marcado, das mensagens que enviei ou dos grupos que criei. Admin sem escopo. */
    private function viewScope(): \Closure
    {
        if (CurrentUser::isAdmin()) {
            return static function (object $builder): void {};
        }

        $me = (int) CurrentUser::id();

        return static function (object $builder) use ($me): void {
            $builder->groupStart()
                ->where('mmt_user_manager_id', $me)
                ->orWhere('mm_sender_user_manager_id', $me)
                ->orWhere('mgl_message_groups_manager_id IN (SELECT id FROM message_groups_manager WHERE owner_user_manager_id = ' . $me . ')', null, false)
            ->groupEnd();
        };
    }

    private function visibleViewRowOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        $me = (int) CurrentUser::id();
        if ((int) ($record['mmt_user_manager_id'] ?? 0) === $me || (int) ($record['mm_sender_user_manager_id'] ?? 0) === $me) {
            return $record;
        }

        $owner = $this->tableModel->db->table('message_groups_manager')
            ->where('id', (int) ($record['mgl_message_groups_manager_id'] ?? 0))
            ->where('owner_user_manager_id', $me)
            ->countAllResults();

        return $owner > 0 ? $record : null;
    }

    /** Escrita administrativa: guest 403; so admin. */
    private function adminOnly(): ?array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin altera marcacoes');
        }

        return null;
    }

    /** Estrutura paginada vazia — usada quando o usuario nao enxerga nenhuma marcacao. */
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
}
