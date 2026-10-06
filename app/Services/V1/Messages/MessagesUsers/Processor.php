<?php

namespace App\Services\V1\Messages\MessagesUsers;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Messages\MessagesUsers\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service de leitura da view view_messages_users (resumo por interlocutor).
 *
 * Somente leitura. Cada usuario ve so as linhas em que ele e o `owner`
 * (mu_owner_user_manager_id); o id do owner vem SEMPRE do token — filtro
 * enviado pelo cliente e descartado. Admin nao e escopado (mesmo escape de
 * MessagesManager) e pode filtrar por owner. Linha de outro usuario "nao
 * existe" (404). A view nao tem deleted_at, entao get-deleted* nao devolvem
 * nada.
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

        return $this->viewModel->findPaginatedView($this->cleanFilters($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->ownerScope());
    }

    public function getGroupedView(array $multiFilters, array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findGroupedView($this->cleanFilters($multiFilters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->ownerScope());
    }

    public function searchView(string $term, array $params, array $filters = []): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->searchByTermView($term, $p['page'], $p['limit'], $p['sort'], $p['order'], $this->cleanFilters($filters), $this->ownerScope());
    }

    public function getView(int $id): ?array
    {
        return $this->ownRowOrNull($this->viewModel->findById($id));
    }

    public function getAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView([], $p['page'], $p['limit'], $p['sort'], $p['order'], $this->ownerScope());
    }

    public function getNoPaginationView(string $sort, string $order, ?int $limit = null): array
    {
        return $this->viewModel->findAllView($sort, $order, $limit, $this->ownerScope());
    }

    public function getDeletedView(int $id): ?array
    {
        return $this->ownRowOrNull($this->viewModel->findDeletedById($id));
    }

    public function getDeletedAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->ownerScope());
    }

    public function getAllWithDeletedView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findAllWithDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->ownerScope());
    }

    /** Descarta o filtro de owner enviado pelo cliente (so admin pode filtrar). */
    private function cleanFilters(array $filters): array
    {
        if (!CurrentUser::isAdmin()) {
            unset($filters['mu_owner_user_manager_id']);
        }

        return $this->removeMasks($filters);
    }

    /** Escopo: so linhas cujo owner e o usuario do JWT — admin nao e escopado. */
    private function ownerScope(): \Closure
    {
        if (CurrentUser::isAdmin()) {
            return static function (object $builder): void {};
        }

        $userId = (int) CurrentUser::id();

        return static function (object $builder) use ($userId): void {
            $builder->where('mu_owner_user_manager_id', $userId);
        };
    }

    private function ownRowOrNull(?array $record): ?array
    {
        if ($record === null) {
            return null;
        }

        if (!CurrentUser::isAdmin() && (int) ($record['mu_owner_user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
            return null;
        }

        return $record;
    }
}
