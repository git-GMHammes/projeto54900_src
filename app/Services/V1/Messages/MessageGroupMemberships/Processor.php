<?php

namespace App\Services\V1\Messages\MessageGroupMemberships;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Messages\MessageGroupMemberships\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service de leitura da view view_message_group_memberships (grupo + dono +
 * membros ativos), fonte da lista Grupos <-> Membros.
 *
 * Somente leitura, com a mesma visibilidade do grupo: o dono, os membros
 * ativos e o admin. Grupo de terceiros "nao existe" (404 / lista vazia).
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }

    public function findView(array $filters, array $params): array
    {
        unset($filters['mg_owner_user_manager_id']);
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView($this->removeMasks($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->scope());
    }

    public function getGroupedView(array $multiFilters, array $params): array
    {
        unset($multiFilters['mg_owner_user_manager_id']);
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findGroupedView($this->removeMasks($multiFilters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->scope());
    }

    /**
     * Busca por grupo (nome, descricao, dono) e pelos MEMBROS (nome, usuario, telefone); quando o termo
     * tem digitos, tambem compara so os digitos — telefone com ou sem mascara acha o mesmo grupo.
     */
    public function searchView(string $term, array $params, array $filters = []): array
    {
        $p      = $this->buildPaginationParams($params);
        $term   = trim($term);
        $digits = (string) preg_replace('/\D+/', '', $term);
        $scope  = $this->scope();

        $withSearch = static function (object $builder) use ($scope, $term, $digits): void {
            $scope($builder);

            if ($term === '') {
                return;
            }

            $builder->groupStart()
                ->like('mg_name', $term)
                ->orLike('mg_description', $term)
                ->orLike('um_username', $term)
                ->orLike('uc_name', $term)
                ->orLike('members_names', $term)
                ->orLike('members_search', $term);

            if ($digits !== '') {
                $builder->orLike('members_search', $digits);
            }

            $builder->groupEnd();
        };

        return $this->viewModel->findPaginatedView(array_intersect_key($this->removeMasks($filters), ['mg_status' => true]), $p['page'], $p['limit'], $p['sort'], $p['order'], $withSearch);
    }

    public function getView(int $id): ?array
    {
        return $this->visibleOrNull($this->viewModel->findById($id));
    }

    public function getAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView([], $p['page'], $p['limit'], $p['sort'], $p['order'], $this->scope());
    }

    public function getNoPaginationView(string $sort, string $order, ?int $limit = null): array
    {
        return $this->viewModel->findAllView($sort, $order, $limit, $this->scope());
    }

    public function getDeletedView(int $id): ?array
    {
        return $this->visibleOrNull($this->viewModel->findDeletedById($id));
    }

    public function getDeletedAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->scope());
    }

    public function getAllWithDeletedView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findAllWithDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->scope());
    }

    /** Escopo: dono ou membro ativo do grupo. Admin sem escopo. */
    private function scope(): \Closure
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

    private function visibleOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        $me = (int) CurrentUser::id();
        if ((int) ($record['mg_owner_user_manager_id'] ?? 0) === $me) {
            return $record;
        }

        $isMember = (new \App\Models\V1\Messages\MessageGroupMembers\SqlTableModel())->isActiveMember((int) $record['id'], $me);

        return $isMember ? $record : null;
    }
}
