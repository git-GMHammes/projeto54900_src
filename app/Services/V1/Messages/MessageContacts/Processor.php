<?php

namespace App\Services\V1\Messages\MessageContacts;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Messages\MessageContacts\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service de leitura da view view_message_contacts — a lista de conversas do MODO CHAT
 * (todos os usuarios com quem se pode conversar).
 *
 * Somente leitura. Escopo fixo: usuarios `active` e **nunca o proprio usuario logado**; guest
 * le vazio; o filtro `um_status` enviado pelo cliente e descartado. A busca textual compara
 * nome, usuario e celular e, quando o termo tem digitos, tambem `phone_digits` — assim
 * "(21) 99999-8888", "21999998888" e "99998888" acham a mesma pessoa.
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

    /** Busca por nome, usuario e celular (com ou sem mascara). */
    public function searchView(string $term, array $params, array $filters = []): array
    {
        $p    = $this->buildPaginationParams($params);
        $term = trim($term);

        return $this->viewModel->findPaginatedView($this->cleanFilters($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->scope($term));
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
        unset($filters['um_status']);

        return $this->removeMasks($filters);
    }

    /**
     * Escopo: so usuarios ativos, nunca o logado; guest nao le. Com `$term`, acrescenta a busca
     * (nome, usuario, celular e, se houver digitos no termo, `phone_digits`).
     */
    private function scope(string $term = ''): \Closure
    {
        $guest  = CurrentUser::roleSlug() === 'guest';
        $me     = (int) CurrentUser::id();
        $digits = (string) preg_replace('/\D+/', '', $term);

        return static function (object $builder) use ($guest, $me, $term, $digits): void {
            $builder->where('um_status', 'active')->where('id !=', $me);

            if ($guest) {
                $builder->where('id', 0);
            }

            if ($term === '') {
                return;
            }

            $builder->groupStart()
                ->like('uc_name', $term)
                ->orLike('um_username', $term)
                ->orLike('uc_phone', $term);

            if ($digits !== '') {
                $builder->orLike('phone_digits', $digits);
            }

            $builder->groupEnd();
        };
    }

    /** Linha do proprio usuario, de usuario inativo ou para guest "nao existe". */
    private function visibleOrNull(?array $record): ?array
    {
        if ($record === null || CurrentUser::roleSlug() === 'guest') {
            return null;
        }

        if (($record['um_status'] ?? null) !== 'active' || (int) $record['id'] === (int) CurrentUser::id()) {
            return null;
        }

        return $record;
    }
}
