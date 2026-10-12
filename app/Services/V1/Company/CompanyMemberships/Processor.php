<?php

namespace App\Services\V1\Company\CompanyMemberships;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Company\CompanyMemberships\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service de leitura da view view_company_memberships (empresa + membros
 * ativos), fonte da lista Empresas <-> Membros. Espelha Messages/MessageGroupMemberships.
 *
 * Somente leitura, com a mesma visibilidade do vinculo: membros ativos da empresa e
 * admin. Empresa de terceiros "nao existe" (404 / lista vazia).
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
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView($this->removeMasks($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->scope());
    }

    public function getGroupedView(array $multiFilters, array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findGroupedView($this->removeMasks($multiFilters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->scope());
    }

    /**
     * Busca por empresa (nome, slug, documento) e pelos MEMBROS (nome, usuario, telefone); quando o termo
     * tem digitos, tambem compara so os digitos — telefone com ou sem mascara acha a mesma empresa.
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
                ->like('co_name', $term)
                ->orLike('co_slug', $term)
                ->orLike('co_document', $term)
                ->orLike('members_names', $term)
                ->orLike('members_search', $term);

            if ($digits !== '') {
                $builder->orLike('members_search', $digits);
            }

            $builder->groupEnd();
        };

        return $this->viewModel->findPaginatedView(array_intersect_key($this->removeMasks($filters), ['co_status' => true]), $p['page'], $p['limit'], $p['sort'], $p['order'], $withSearch);
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

    /** Escopo: membro ativo da empresa. Admin sem escopo. */
    private function scope(): \Closure
    {
        if (CurrentUser::isAdmin()) {
            return static function (object $builder): void {};
        }

        $me = (int) CurrentUser::id();

        return static function (object $builder) use ($me): void {
            $builder->where('id IN (SELECT company_id FROM company_members WHERE user_manager_id = ' . $me . " AND status = 'active' AND deleted_at IS NULL)", null, false);
        };
    }

    private function visibleOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::isAdmin()) {
            return $record;
        }

        $isMember = (new \App\Models\V1\Company\CompanyMembers\SqlTableModel())->isActiveMember((int) $record['id'], (int) CurrentUser::id());

        return $isMember ? $record : null;
    }
}
