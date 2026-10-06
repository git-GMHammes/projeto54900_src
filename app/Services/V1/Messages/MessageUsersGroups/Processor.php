<?php

namespace App\Services\V1\Messages\MessageUsersGroups;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Messages\MessageUsersGroups\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service de leitura da view view_message_users_groups (usuario + contagem de
 * grupos), fonte do card de usuarios da tela Grupos <-> Membros.
 *
 * Somente leitura. Usuario comum: so usuarios `active` (o filtro de status do cliente e descartado). ADMIN: todos os
 * usuarios, de qualquer status, e pode filtrar por `um_status` (listagem administrativa sem trava). Guest nao le (lista vazia). A view so expoe nome, e-mail,
 * username e os grupos ativos — nenhum dado pessoal sensivel.
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

        return $this->viewModel->findPaginatedView($this->cleanFilters($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->scope());
    }

    public function getGroupedView(array $multiFilters, array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findGroupedView($this->cleanFilters($multiFilters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->scope());
    }

    public function searchView(string $term, array $params, array $filters = []): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->searchByTermView($term, $p['page'], $p['limit'], $p['sort'], $p['order'], $this->cleanFilters($filters), $this->scope());
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

    /** Descarta o filtro de status do cliente: o escopo ja fixa `active`. */
    private function cleanFilters(array $filters): array
    {
        if (!CurrentUser::isAdmin()) {
            unset($filters['um_status']);
        }

        return $this->removeMasks($filters);
    }

    /** Escopo: guest nao le; os demais veem so usuarios ativos. */
    private function scope(): \Closure
    {
        $guest = CurrentUser::roleSlug() === 'guest';
        $admin = CurrentUser::isAdmin();

        return static function (object $builder) use ($guest, $admin): void {
            if (!$admin) {
                $builder->where('um_status', 'active');
            }
            if ($guest) {
                $builder->where('id', 0);
            }
        };
    }

    private function visibleOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::roleSlug() === 'guest' || (($record['um_status'] ?? null) !== 'active' && !CurrentUser::isAdmin())) {
            return null;
        }

        return $record;
    }
}
