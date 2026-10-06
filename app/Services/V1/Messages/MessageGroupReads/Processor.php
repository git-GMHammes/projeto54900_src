<?php

namespace App\Services\V1\Messages\MessageGroupReads;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Messages\MessageGroupReads\SqlTableModel;
use App\Models\V1\Messages\MessageGroupReads\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Messages/MessageGroupReads — leitura por membro de uma mensagem de
 * grupo (message_group_reads). Message NAO e chat de sala. Regras:
 *
 *  - Guest nao escreve (403).
 *  - Create ("li esta mensagem"): a mensagem precisa existir, ser de GRUPO, estar `sent` (404/422) e o
 *    usuario ser membro ativo do grupo (senao 404 — nem sabe que existe). O remetente nao le a propria
 *    mensagem (422). `user_manager_id` do corpo so vale para admin (403 para os demais). E
 *    IDEMPOTENTE: ler de novo devolve a leitura existente; uma soft-deletada e reativada.
 *  - Update (`read_at`), delete-soft/restore/hard e clear-deleted: so admin (403) — a leitura e um
 *    registro de sistema, nao do usuario.
 *  - Visibilidade (tabela e view): as leituras do proprio usuario, as das mensagens que ele enviou
 *    ("quem leu"), as dos grupos que ele criou e admin; fora disso "nao existe" (404 / lista vazia).
 */
class Processor extends BaseTableService
{
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
        $me        = (int) CurrentUser::id();
        $userId    = (int) ($data['user_manager_id'] ?? 0);
        $userId    = $userId > 0 ? $userId : $me;

        if ($userId !== $me && !CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin registra leitura em nome de outro usuario');
        }

        $message = $this->tableModel->findGroupMessage($messageId);
        if ($message === null) {
            return $this->notFound('Mensagem de grupo nao encontrada');
        }

        if (!$this->tableModel->isActiveUser($userId)) {
            return $this->notFound('Usuario nao encontrado');
        }

        if (!$this->tableModel->isActiveMember((int) $message['group_id'], $userId)) {
            return $this->notFound('Mensagem de grupo nao encontrada');
        }

        if ($message['status'] !== 'sent' && !CurrentUser::isAdmin()) { // admin registra leitura em qualquer status
            return $this->invalid('So mensagem ja enviada pode ser lida');
        }

        if ((int) $message['sender_id'] === $userId && !CurrentUser::isAdmin()) { // admin registra ate a do remetente
            return $this->invalid('O remetente nao precisa ler a propria mensagem');
        }

        $existing = $this->tableModel->findPair($messageId, $userId);
        if ($existing !== null) {
            if ($existing['deleted_at'] !== null) {
                $this->tableModel->reactivate((int) $existing['id']);
            }

            return ['success' => true, 'data' => $this->tableModel->find((int) $existing['id'])];
        }

        $id = $this->tableModel->insertRead($messageId, $userId);
        if ($id === 0) {
            return ['success' => false, 'message' => 'Erro ao registrar a leitura', 'code' => 500];
        }

        return ['success' => true, 'data' => $this->tableModel->find($id)];
    }

    public function update(int $id, array $data): array
    {
        $guard = $this->adminOnly();
        if ($guard !== null) {
            return $guard;
        }

        $readAt = trim((string) ($data['read_at'] ?? ''));
        if ($readAt === '' || strtotime($readAt) === false) {
            return $this->invalid('Informe a data da leitura');
        }

        return parent::update($id, ['read_at' => $readAt]);
    }

    public function deleteSoft(int $id): array
    {
        return $this->adminOnly() ?? parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        return $this->adminOnly() ?? parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        return $this->adminOnly() ?? parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        return $this->adminOnly() ?? parent::clearDeleted($id);
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

    /** Ids de leituras visiveis ao usuario da sessao; null = admin (sem restricao). */
    private function visibleIds(): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        return $this->tableModel->findVisibleIds((int) CurrentUser::id());
    }

    /** A leitura (linha da tabela) e visivel ao usuario da sessao? */
    private function visibleOrNull(?array $row): ?array
    {
        if ($row === null || CurrentUser::isAdmin()) {
            return $row;
        }

        $ids = $this->tableModel->findVisibleIds((int) CurrentUser::id());

        return in_array((int) $row['id'], $ids, true) ? $row : null;
    }

    /** Escopo da view: leituras proprias, das mensagens que enviei ou dos grupos que criei. Admin sem escopo. */
    private function viewScope(): \Closure
    {
        if (CurrentUser::isAdmin()) {
            return static function (object $builder): void {};
        }

        $me = (int) CurrentUser::id();

        return static function (object $builder) use ($me): void {
            $builder->groupStart()
                ->where('mgr_user_manager_id', $me)
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
        if ((int) ($record['mgr_user_manager_id'] ?? 0) === $me || (int) ($record['mm_sender_user_manager_id'] ?? 0) === $me) {
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
            return $this->forbidden('Somente admin altera ou exclui leituras');
        }

        return null;
    }

    /** Estrutura paginada vazia — usada quando o usuario nao enxerga nenhuma leitura. */
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
