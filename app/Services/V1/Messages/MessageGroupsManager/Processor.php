<?php

namespace App\Services\V1\Messages\MessageGroupsManager;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Messages\MessageGroupsManager\SqlTableModel;
use App\Models\V1\Messages\MessageGroupsManager\SqlViewModel;
use App\Models\V1\User\UserManager\SqlTableModel as UserManagerModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Messages/MessageGroupsManager — o grupo.
 *
 * Message NAO e chat: o grupo so agrupa usuarios (message_group_members) e e o
 * alvo de mensagens de grupo (message_group_messages). Regras:
 *
 *  - Guest nao cria/edita/exclui grupo (403).
 *  - Create exige usuario ativo. O dono e sempre o usuario da sessao
 *    (owner_user_manager_id do corpo e ignorado); o grupo nasce `active` e o
 *    dono entra como membro (role=owner) na mesma transacao.
 *  - Update/delete-*: so o dono ou admin. Quem enxerga o grupo mas nao e o dono
 *    recebe 403; quem nem enxerga recebe 404. `owner_user_manager_id` e imutavel;
 *    `status` alterna active/inactive.
 *  - Visibilidade (tabela e view): o dono, os membros ativos e admin; o grupo
 *    de terceiros "nao existe" (404 / lista vazia).
 *  - clear-deleted e so admin (defesa em profundidade — a rota ja tem adminonly).
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
        $ownerId = $this->resolveOwnerId($data);

        if ($ownerId !== (int) CurrentUser::id() && !CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin cria grupo em nome de outro usuario');
        }

        $owner = $this->usersModel->find($ownerId);
        if ($owner === null) {
            return $this->notFound();
        }

        if (($owner['status'] ?? null) !== 'active') {
            return $this->forbidden('O dono do grupo precisa ser um usuario ativo');
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        $data['owner_user_manager_id'] = $this->resolveOwnerId($data);

        if (!in_array($data['status'] ?? null, ['active', 'inactive'], true)) {
            $data['status'] = 'active';
        }

        return $data;
    }

    /** Dono do create: o do corpo (so admin pode diferir da sessao) ou o usuario da sessao. */
    private function resolveOwnerId(array $data): int
    {
        $sent = (int) ($data['owner_user_manager_id'] ?? 0);

        return $sent > 0 ? $sent : (int) CurrentUser::id();
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        return array_intersect_key($data, array_flip(['name', 'description', 'status']));
    }

    // -------------------------------------------------------------------------
    // Escrita — dono ou admin
    // -------------------------------------------------------------------------

    /** Create do grupo + dono como membro, numa so transacao. */
    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $userId = (int) CurrentUser::id();
        $user   = $this->usersModel->find($userId);

        if ($user === null || ($user['status'] ?? null) !== 'active') {
            return $this->forbidden('Somente usuario ativo pode criar grupos');
        }

        $db = $this->tableModel->db;
        $db->transStart();

        $result = parent::create($data);

        if ($result['success'] ?? false) {
            $this->tableModel->addOwnerMember((int) $result['data']['id'], (int) $result['data']['owner_user_manager_id']);
        }

        $db->transComplete();

        if (!$db->transStatus()) {
            return ['success' => false, 'message' => 'Erro ao criar o grupo e o vinculo do dono', 'code' => 500];
        }

        return $result;
    }

    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertOwner($id);
        if ($guarded !== null) {
            return $guarded;
        }

        // O formulario manda o dono junto: igual ao gravado e ignorado; diferente e recusado.
        $incomingOwner = (int) ($data['owner_user_manager_id'] ?? 0);
        $existing      = $this->tableModel->find($id);
        if ($incomingOwner > 0 && $existing !== null && $incomingOwner !== (int) $existing['owner_user_manager_id']) {
            return $this->forbidden('O dono do grupo nao pode ser alterado');
        }

        $payload = $this->prepareUpdateData($id, $this->sanitizeData($data));
        if ($payload === []) {
            return $this->invalid('Informe o nome, a descricao ou o status');
        }

        return parent::update($id, $payload);
    }

    public function deleteSoft(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertOwner($id);
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

        $guarded = $this->assertOwner($id, true);
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

        $guarded = $this->assertOwner($id, true);
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
    // Leitura — Tabela restrita a dono/membro ativo/admin
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
        unset($filters['mg_owner_user_manager_id']);
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView($this->removeMasks($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->viewScope());
    }

    public function getGroupedView(array $multiFilters, array $params): array
    {
        unset($multiFilters['mg_owner_user_manager_id']);
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

    /** Ids visiveis ao usuario da sessao; null = admin (sem restricao). */
    private function visibleIds(): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        return $this->tableModel->findVisibleIds((int) CurrentUser::id());
    }

    private function canSee(int $groupId, int $ownerId): bool
    {
        $me = (int) CurrentUser::id();

        return $ownerId === $me || $this->tableModel->isActiveMember($groupId, $me);
    }

    /** Grupo fora da regra de visibilidade "nao existe" (404). */
    private function visibleOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        return $this->canSee((int) $record['id'], (int) ($record['owner_user_manager_id'] ?? 0)) ? $record : null;
    }

    /** Escopo da view: dono ou membro ativo. Admin sem escopo. */
    private function viewScope(): \Closure
    {
        if (CurrentUser::isAdmin()) {
            return static function (object $builder): void {};
        }

        $me = (int) CurrentUser::id();

        return static function (object $builder) use ($me): void {
            $builder->groupStart()
                ->where('mg_owner_user_manager_id', $me)
                ->orWhere('id IN (SELECT message_groups_manager_id FROM message_group_members WHERE user_manager_id = ' . $me . " AND status = 'active' AND deleted_at IS NULL)", null, false)
            ->groupEnd();
        };
    }

    private function visibleViewRowOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        return $this->canSee((int) $record['id'], (int) ($record['mg_owner_user_manager_id'] ?? 0)) ? $record : null;
    }

    /** Escrita: so o dono ou admin; quem nem enxerga o grupo recebe 404. */
    private function assertOwner(int $id, bool $includeDeleted = false): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        $existing = $includeDeleted
            ? $this->tableModel->findWithDeleted($id)
            : $this->tableModel->find($id);

        if ($existing === null || !$this->canSee($id, (int) ($existing['owner_user_manager_id'] ?? 0))) {
            return $this->notFound();
        }

        if ((int) ($existing['owner_user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
            return $this->forbidden('Somente o dono do grupo pode alterar ou excluir');
        }

        return null;
    }

    /** Estrutura paginada vazia — usada quando o usuario nao enxerga nenhum grupo. */
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

    private function notFound(): array
    {
        return ['success' => false, 'message' => 'Registro nao encontrado ou foi excluido', 'code' => 404];
    }
}
