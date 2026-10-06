<?php

namespace App\Services\V1\Messages\MessageGroupMembers;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Messages\MessageGroupMembers\SqlTableModel;
use App\Models\V1\Messages\MessageGroupMembers\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Messages/MessageGroupMembers — o vinculo N:N
 * usuario <-> grupo (message_group_members).
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - Escrita (create, update, delete-*, sync): so o dono do grupo ou admin. Quem
 *    enxerga o grupo mas nao e o dono recebe 403; quem nem enxerga recebe 404.
 *  - O vinculo do dono (role=owner) nunca e removido nem alterado.
 *  - Adicionar exige grupo `active` (409) e usuario existente (404) e `active` (409).
 *    Vinculo ja existente (left/removed/soft-deletado) e reativado; ja ativo e ignorado.
 *  - sync grava varios vinculos numa unica transacao: tudo ou nada.
 *  - Visibilidade (tabela e view): vinculos dos grupos que o usuario criou ou em que
 *    e membro ativo; admin ve tudo. Vinculo fora disso "nao existe" (404 / lista vazia).
 *  - clear-deleted e so admin.
 */
class Processor extends BaseTableService
{
    /** Teto de usuarios por lista (add e remove) em uma chamada de sync. */
    private const SYNC_LIMIT = 1000;

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

    /**
     * Sincroniza os membros de um grupo: adiciona/reativa `$addIds` e remove `$removeIds`.
     *
     * @param  array<int, mixed> $addIds
     * @param  array<int, mixed> $removeIds
     * @return array{success: bool, data?: array, message?: string, code?: int}
     */
    public function sync(int $groupId, array $addIds, array $removeIds): array
    {
        $add    = $this->normalizeIds($addIds);
        $remove = $this->normalizeIds($removeIds);

        if ($add === null || $remove === null) {
            return $this->invalid('Os ids de usuario devem ser numeros inteiros positivos');
        }

        if ($add === [] && $remove === []) {
            return $this->invalid('Informe ao menos um usuario para adicionar ou remover');
        }

        if (count($add) > self::SYNC_LIMIT || count($remove) > self::SYNC_LIMIT) {
            return $this->invalid('Maximo de ' . self::SYNC_LIMIT . ' usuarios por lista');
        }

        if (array_intersect($add, $remove) !== []) {
            return $this->invalid('Um usuario nao pode estar em adicionar e remover ao mesmo tempo');
        }

        $guard = $this->assertGroupWriter($groupId, $add !== []);
        if ($guard['error'] !== null) {
            return $guard['error'];
        }

        $ownerId = (int) $guard['group']['owner_user_manager_id'];

        if ($add !== []) {
            $statuses = $this->tableModel->userStatuses($add);
            foreach ($add as $userId) {
                if (!isset($statuses[$userId])) {
                    return $this->notFound('Usuario ' . $userId . ' nao encontrado');
                }
                if ($statuses[$userId] !== 'active' && !CurrentUser::isAdmin()) { // admin adiciona qualquer usuario existente
                    return $this->conflict('O usuario ' . $userId . ' esta inativo ou bloqueado');
                }
            }
        }

        $counts = ['added' => 0, 'reactivated' => 0, 'removed' => 0, 'skipped' => 0];

        $db = $this->tableModel->db;
        $db->transStart();

        foreach ($add as $userId) {
            $this->applyAdd($groupId, $userId, $counts);
        }

        foreach ($remove as $userId) {
            if ($userId === $ownerId) {
                $counts['skipped']++;
                continue;
            }

            $pair = $this->tableModel->findPair($groupId, $userId);
            if ($pair === null || $pair['status'] !== 'active' || $pair['deleted_at'] !== null) {
                $counts['skipped']++;
                continue;
            }

            $this->tableModel->markRemoved((int) $pair['id']);
            $counts['removed']++;
        }

        $db->transComplete();

        if (!$db->transStatus()) {
            return ['success' => false, 'message' => 'Erro ao sincronizar os membros do grupo', 'code' => 500];
        }

        return ['success' => true, 'data' => $counts];
    }

    public function create(array $data): array
    {
        $groupId = (int) ($data['message_groups_manager_id'] ?? 0);
        $userId  = (int) ($data['user_manager_id'] ?? 0);

        $result = $this->sync($groupId, [$userId], []);
        if (!($result['success'] ?? false)) {
            return $result;
        }

        return ['success' => true, 'data' => $this->tableModel->findPair($groupId, $userId)];
    }

    public function update(int $id, array $data): array
    {
        $guarded = $this->guardRow($id, false);
        if ($guarded['error'] !== null) {
            return $guarded['error'];
        }

        $status = $data['status'] ?? null;
        if (!in_array($status, ['active', 'removed'], true)) {
            return $this->invalid('O status deve ser active ou removed');
        }

        $row = $guarded['row'];
        if ($row['role'] === 'owner') {
            return $this->forbidden('O vinculo do dono nao pode ser alterado');
        }

        $result = $this->sync((int) $row['message_groups_manager_id'], $status === 'active' ? [(int) $row['user_manager_id']] : [], $status === 'removed' ? [(int) $row['user_manager_id']] : []);
        if (!($result['success'] ?? false)) {
            return $result;
        }

        return ['success' => true, 'data' => $this->tableModel->find($id)];
    }

    public function deleteSoft(int $id): array
    {
        $guarded = $this->guardRow($id, false, true);
        if ($guarded['error'] !== null) {
            return $guarded['error'];
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        $guarded = $this->guardRow($id, true);
        if ($guarded['error'] !== null) {
            return $guarded['error'];
        }

        return parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        $guarded = $this->guardRow($id, true, true);
        if ($guarded['error'] !== null) {
            return $guarded['error'];
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
    // Leitura — Tabela restrita aos vinculos dos grupos do usuario
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

    /**
     * Valida e deduplica uma lista de ids de usuario; null se algum item nao for inteiro positivo.
     *
     * @param  array<int, mixed> $ids
     * @return list<int>|null
     */
    private function normalizeIds(array $ids): ?array
    {
        $out = [];
        foreach ($ids as $id) {
            if (is_int($id)) {
                $value = $id;
            } elseif (is_string($id) && ctype_digit($id)) {
                $value = (int) $id;
            } else {
                return null;
            }

            if ($value < 1) {
                return null;
            }

            $out[$value] = $value;
        }

        return array_values($out);
    }

    /** Aplica um add: insere, reativa ou ignora (ja ativo), somando em $counts. */
    private function applyAdd(int $groupId, int $userId, array &$counts): void
    {
        $pair = $this->tableModel->findPair($groupId, $userId);

        if ($pair === null) {
            $this->tableModel->insertMember($groupId, $userId);
            $counts['added']++;

            return;
        }

        if ($pair['status'] === 'active' && $pair['deleted_at'] === null) {
            $counts['skipped']++;

            return;
        }

        $this->tableModel->reactivate((int) $pair['id']);
        $counts['reactivated']++;
    }

    /**
     * Confere se o usuario da sessao pode escrever no grupo (dono ou admin).
     *
     * @return array{error: ?array, group: ?array}
     */
    private function assertGroupWriter(int $groupId, bool $adding): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return ['error' => $this->forbidden(), 'group' => null];
        }

        $group = $this->tableModel->findGroup($groupId);
        if ($group === null) {
            return ['error' => $this->notFound('Grupo nao encontrado'), 'group' => null];
        }

        $me = (int) CurrentUser::id();
        if (!CurrentUser::isAdmin() && (int) $group['owner_user_manager_id'] !== $me) {
            if (!$this->tableModel->isActiveMember($groupId, $me)) {
                return ['error' => $this->notFound('Grupo nao encontrado'), 'group'  => null];
            }

            return ['error' => $this->forbidden('Somente o dono do grupo pode gerenciar os membros'), 'group' => null];
        }

        if ($adding && $group['status'] !== 'active' && !CurrentUser::isAdmin()) { // admin adiciona tambem em grupo inativo
            return ['error' => $this->conflict('Grupo inativo nao recebe novos membros'), 'group' => null];
        }

        return ['error' => null, 'group' => $group];
    }

    /**
     * Carrega o vinculo e confere escrita no grupo dele.
     *
     * @return array{error: ?array, row: ?array}
     */
    private function guardRow(int $id, bool $includeDeleted, bool $blockOwnerRow = false): array
    {
        $row = $includeDeleted ? $this->tableModel->findWithDeleted($id) : $this->tableModel->find($id);
        if ($row === null) {
            return ['error' => $this->notFound('Registro nao encontrado ou foi excluido'), 'row' => null];
        }

        $guard = $this->assertGroupWriter((int) $row['message_groups_manager_id'], false);
        if ($guard['error'] !== null) {
            return ['error' => $guard['error'], 'row' => null];
        }

        if ($blockOwnerRow && $row['role'] === 'owner') {
            return ['error' => $this->forbidden('O vinculo do dono nao pode ser excluido'), 'row' => null];
        }

        return ['error' => null, 'row' => $row];
    }

    /** Ids de vinculos visiveis ao usuario da sessao; null = admin (sem restricao). */
    private function visibleIds(): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        return $this->tableModel->findVisibleIds((int) CurrentUser::id());
    }

    private function canSeeGroup(int $groupId): bool
    {
        if (CurrentUser::isAdmin()) {
            return true;
        }

        $group = $this->tableModel->findGroup($groupId);
        $me    = (int) CurrentUser::id();

        return ($group !== null && (int) $group['owner_user_manager_id'] === $me) || $this->tableModel->isActiveMember($groupId, $me);
    }

    /** Vinculo de grupo fora da regra de visibilidade "nao existe" (404). */
    private function visibleOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        return $this->canSeeGroup((int) $record['message_groups_manager_id']) ? $record : null;
    }

    /** Escopo da view: vinculos dos grupos do usuario (dono ou membro ativo). Admin sem escopo. */
    private function viewScope(): \Closure
    {
        if (CurrentUser::isAdmin()) {
            return static function (object $builder): void {};
        }

        $me = (int) CurrentUser::id();

        return static function (object $builder) use ($me): void {
            $builder->groupStart()
                ->where('mgm_message_groups_manager_id IN (SELECT id FROM message_groups_manager WHERE owner_user_manager_id = ' . $me . ')', null, false)
                ->orWhere('mgm_message_groups_manager_id IN (SELECT message_groups_manager_id FROM message_group_members WHERE user_manager_id = ' . $me . " AND status = 'active' AND deleted_at IS NULL)", null, false)
            ->groupEnd();
        };
    }

    private function visibleViewRowOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        return $this->canSeeGroup((int) ($record['mgm_message_groups_manager_id'] ?? 0)) ? $record : null;
    }

    /** Estrutura paginada vazia — usada quando o usuario nao enxerga nenhum vinculo. */
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
