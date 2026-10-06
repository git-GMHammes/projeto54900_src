<?php

namespace App\Services\V1\Messages\MessageGroupChat;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Messages\MessageGroupChat\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service de leitura da view view_message_group_chat_summary (resumo do chat por membro e grupo:
 * nao lidas e ultima mensagem).
 *
 * Somente leitura. Cada usuario ve so as linhas em que ele e o membro (`mgcs_member_user_manager_id`
 * vem do token; filtro de membro enviado pelo cliente e descartado). Admin nao e escopado e pode
 * filtrar por membro. Guest le vazio. Linha de outro usuario = 404. A view nao tem deleted_at real
 * (sempre NULL), entao get-deleted* nao devolvem nada.
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

        return $this->viewModel->searchByTermView($term, $p['page'], $p['limit'], $p['sort'], $p['order'], $filters, $this->ownerScope());
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

    /** Descarta o filtro de membro enviado pelo cliente (so admin pode filtrar). */
    private function cleanFilters(array $filters): array
    {
        if (!CurrentUser::isAdmin()) {
            unset($filters['mgcs_member_user_manager_id']);
        }

        return $this->removeMasks($filters);
    }

    /** Escopo: so linhas cujo membro e o usuario do JWT; guest nao le; admin nao e escopado. */
    private function ownerScope(): \Closure
    {
        if (CurrentUser::isAdmin()) {
            return static function (object $builder): void {};
        }

        $userId = CurrentUser::roleSlug() === 'guest' ? 0 : (int) CurrentUser::id();

        return static function (object $builder) use ($userId): void {
            $builder->where('mgcs_member_user_manager_id', $userId);
        };
    }

    private function ownRowOrNull(?array $record): ?array
    {
        if ($record === null) {
            return null;
        }

        if (CurrentUser::isAdmin()) {
            return $record;
        }

        if (CurrentUser::roleSlug() === 'guest' || (int) ($record['mgcs_member_user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
            return null;
        }

        return $record;
    }
}
