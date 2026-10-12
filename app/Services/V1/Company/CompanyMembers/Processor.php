<?php

namespace App\Services\V1\Company\CompanyMembers;

use App\Libraries\Auth\CurrentUser;
use App\Libraries\Company\CompanyMembership;
use App\Models\V1\Company\CompanyMembers\SqlTableModel;
use App\Models\V1\Company\CompanyMembers\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Company/CompanyMembers — o vinculo N:N
 * usuario <-> empresa (company_members). Espelha Messages/MessageGroupMembers.
 *
 * Regras:
 *  - Escrita (create, update, delete-*, sync): so admin (403). Empresa nao tem
 *    "dono"; o filtro 'adminonly' das rotas ja barra, aqui e a segunda trava.
 *  - Adicionar exige empresa existente (404) e usuario existente (404). Vinculo ja
 *    existente (left/removed/soft-deletado) e reativado; ja ativo e ignorado.
 *  - sync grava varios vinculos numa unica transacao: tudo ou nada.
 *  - Todo vinculo alterado recalcula user_manager.company_ids (CompanyMembership).
 *  - Visibilidade (tabela e view): vinculos das empresas em que o usuario e membro
 *    ativo; admin ve tudo. Vinculo fora disso "nao existe" (404 / lista vazia).
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
     * Sincroniza os membros de uma empresa: adiciona/reativa `$addIds` e remove `$removeIds`.
     *
     * @param  array<int, mixed> $addIds
     * @param  array<int, mixed> $removeIds
     * @return array{success: bool, data?: array, message?: string, code?: int}
     */
    public function sync(int $companyId, array $addIds, array $removeIds): array
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

        $guard = $this->assertWriter($companyId);
        if ($guard !== null) {
            return $guard;
        }

        if ($add !== []) {
            $statuses = $this->tableModel->userStatuses($add);
            foreach ($add as $userId) {
                if (!isset($statuses[$userId])) {
                    return $this->notFound('Usuario ' . $userId . ' nao encontrado');
                }
            }
        }

        $counts = ['added' => 0, 'reactivated' => 0, 'removed' => 0, 'skipped' => 0];

        $db = $this->tableModel->db;
        $db->transStart();

        foreach ($add as $userId) {
            $this->applyAdd($companyId, $userId, $counts);
        }

        foreach ($remove as $userId) {
            $pair = $this->tableModel->findPair($companyId, $userId);
            if ($pair === null || $pair['status'] !== 'active' || $pair['deleted_at'] !== null) {
                $counts['skipped']++;
                continue;
            }

            $this->tableModel->markRemoved((int) $pair['id']);
            $counts['removed']++;
        }

        $db->transComplete();

        if (!$db->transStatus()) {
            return ['success' => false, 'message' => 'Erro ao sincronizar os membros da empresa', 'code' => 500];
        }

        foreach (array_merge($add, $remove) as $userId) {
            CompanyMembership::syncUserCompanyIds($userId);
        }

        return ['success' => true, 'data' => $counts];
    }

    public function create(array $data): array
    {
        $companyId = (int) ($data['company_id'] ?? 0);
        $userId    = (int) ($data['user_manager_id'] ?? 0);

        $result = $this->sync($companyId, [$userId], []);
        if (!($result['success'] ?? false)) {
            return $result;
        }

        return ['success' => true, 'data' => $this->tableModel->findPair($companyId, $userId)];
    }

    public function update(int $id, array $data): array
    {
        $guarded = $this->guardRow($id, false);
        if ($guarded['error'] !== null) {
            return $guarded['error'];
        }

        $status = $data['status'] ?? null;
        $role   = $data['role'] ?? null;

        if (!in_array($status, ['active', 'removed'], true) && !in_array($role, ['admin', 'member'], true)) {
            return $this->invalid('Informe status (active/removed) ou role (admin/member)');
        }

        $row = $guarded['row'];

        $changes = [];
        if (in_array($status, ['active', 'removed'], true)) {
            $changes['status'] = $status;
            if ($status === 'active') {
                $changes['deleted_at'] = null;
            }
        }
        if (in_array($role, ['admin', 'member'], true)) {
            $changes['role'] = $role;
        }

        $this->tableModel->db->table('company_members')->where('id', $id)->update($changes);
        CompanyMembership::syncUserCompanyIds((int) $row['user_manager_id']);

        return ['success' => true, 'data' => $this->tableModel->find($id)];
    }

    public function deleteSoft(int $id): array
    {
        return $this->withReconcile($id, false, fn (): array => parent::deleteSoft($id));
    }

    public function deleteRestore(int $id): array
    {
        return $this->withReconcile($id, true, fn (): array => parent::deleteRestore($id));
    }

    public function deleteHard(int $id): array
    {
        return $this->withReconcile($id, true, fn (): array => parent::deleteHard($id));
    }

    public function clearDeleted(?int $id = null): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode limpar registros excluidos');
        }

        return parent::clearDeleted($id);
    }

    // -------------------------------------------------------------------------
    // Leitura — Tabela restrita aos vinculos das empresas do usuario
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
    private function applyAdd(int $companyId, int $userId, array &$counts): void
    {
        $pair = $this->tableModel->findPair($companyId, $userId);

        if ($pair === null) {
            $this->tableModel->insertMember($companyId, $userId);
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
     * Confere se o usuario da sessao pode escrever nos vinculos da empresa (admin)
     * e se a empresa existe. Devolve o erro, ou null se liberado.
     */
    private function assertWriter(int $companyId): ?array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode gerenciar os membros da empresa');
        }

        // Resposta unica para empresa inexistente e empresa de outra sessao (nao revela qual).
        if ($companyId !== CurrentUser::companyId() || $this->tableModel->findCompany($companyId) === null) {
            return $this->notFound('Empresa nao encontrada');
        }

        return null;
    }

    /**
     * Carrega o vinculo e confere escrita (admin).
     *
     * @return array{error: ?array, row: ?array}
     */
    private function guardRow(int $id, bool $includeDeleted): array
    {
        if (!CurrentUser::isAdmin()) {
            return ['error' => $this->forbidden('Somente admin pode gerenciar os membros da empresa'), 'row' => null];
        }

        $row = $includeDeleted ? $this->tableModel->findWithDeleted($id) : $this->tableModel->find($id);
        if ($row === null) {
            return ['error' => $this->notFound(), 'row' => null];
        }

        return ['error' => null, 'row' => $row];
    }

    /**
     * Executa uma exclusao/restauracao do vinculo e, se der certo, recalcula o
     * company_ids do usuario dono do vinculo.
     */
    private function withReconcile(int $id, bool $includeDeleted, \Closure $action): array
    {
        $guarded = $this->guardRow($id, $includeDeleted);
        if ($guarded['error'] !== null) {
            return $guarded['error'];
        }

        $result = $action();

        if ($result['success'] ?? false) {
            CompanyMembership::syncUserCompanyIds((int) $guarded['row']['user_manager_id']);
        }

        return $result;
    }

    /** Ids de vinculos visiveis ao usuario da sessao; null = admin (sem restricao). */
    private function visibleIds(): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        return $this->tableModel->findVisibleIds((int) CurrentUser::id());
    }

    private function canSeeCompany(int $companyId): bool
    {
        // A sessao pertence a UMA empresa: nem o admin administra vinculos de outra empresa por aqui.
        if ($companyId !== CurrentUser::companyId()) {
            return false;
        }

        return CurrentUser::isAdmin() || $this->tableModel->isActiveMember($companyId, (int) CurrentUser::id());
    }

    /** Vinculo de empresa fora da regra de visibilidade "nao existe" (404). */
    private function visibleOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        return $this->canSeeCompany((int) $record['company_id']) ? $record : null;
    }

    /** Escopo da view: vinculos das empresas do usuario (membro ativo). Admin sem escopo. */
    private function viewScope(): \Closure
    {
        if (CurrentUser::isAdmin()) {
            return static function (object $builder): void {};
        }

        $me = (int) CurrentUser::id();

        return static function (object $builder) use ($me): void {
            $builder->where('cm_company_id IN (SELECT company_id FROM company_members WHERE user_manager_id = ' . $me . " AND status = 'active' AND deleted_at IS NULL)", null, false);
        };
    }

    private function visibleViewRowOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        return $this->canSeeCompany((int) ($record['cm_company_id'] ?? 0)) ? $record : null;
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

    private function forbidden(string $message = 'Operacao nao permitida para este usuario'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 403];
    }

    private function notFound(string $message = 'Registro nao encontrado ou foi excluido'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 404];
    }
}
