<?php

namespace App\Models\V1;

use CodeIgniter\Model;

/**
 * Model base para leitura de views SQL na API V1.
 *
 * Fornece todos os métodos de consulta usados por BaseViewService:
 *   findPaginatedView, findGroupedView, searchByTermView,
 *   findById, findDeletedById, findDeletedPaginatedView,
 *   findAllView, findAllWithDeletedPaginatedView
 *
 * Classes filhas devem declarar:
 *   $DBGroup, $table, $primaryKey, $likeFields, $sortableFields, $searchFields
 */
abstract class BaseViewModel extends Model
{
    protected $allowedFields = [];

    /** Campos que usam LIKE %valor% em findPaginatedView quando presentes nos filtros. */
    protected array $likeFields = [];

    /** Campos permitidos para ORDER BY — protege contra SQL injection. */
    protected array $sortableFields = [];

    /** Campos usados na busca textual (searchByTermView). */
    public array $searchFields = [];

    // -------------------------------------------------------------------------
    // Helpers internos
    // -------------------------------------------------------------------------

    private function safeSort(string $sort): string
    {
        return \in_array($sort, $this->sortableFields, true) ? $sort : $this->primaryKey;
    }

    private function safeOrder(string $order): string
    {
        return \in_array(strtolower($order), ['asc', 'desc'], true) ? strtolower($order) : 'desc';
    }

    /**
     * Executa COUNT + resultado paginado sobre o builder recebido.
     */
    private function paginateBuilder(object $builder, int $page, int $limit, string $sort, string $order): array
    {
        $total = (clone $builder)->countAllResults(false);

        $rows = $builder
            ->orderBy($this->safeSort($sort), $this->safeOrder($order))
            ->limit($limit, ($page - 1) * $limit)
            ->get()
            ->getResultArray();

        return [
            'data'       => $rows,
            'pagination' => [
                'page'  => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => $total > 0 ? (int) ceil($total / $limit) : 0,
            ],
        ];
    }

    // -------------------------------------------------------------------------
    // Leitura paginada
    // -------------------------------------------------------------------------

    /**
     * Consulta paginada com filtros exatos (ou LIKE para campos em $likeFields).
     */
    public function findPaginatedView(array $filters, int $page, int $limit, string $sort, string $order): array
    {
        $builder = $this->db->table($this->table);

        foreach ($filters as $field => $value) {
            if (\in_array($field, $this->likeFields, true)) {
                $builder->like($field, $value);
            } else {
                $builder->where($field, $value);
            }
        }

        return $this->paginateBuilder($builder, $page, $limit, $sort, $order);
    }

    /**
     * Consulta paginada com filtros multivalorados (WHERE IN).
     *
     * @param array $multiFilters Mapa [campo => array_de_valores]
     */
    public function findGroupedView(array $multiFilters, int $page, int $limit, string $sort, string $order): array
    {
        $builder = $this->db->table($this->table);

        foreach ($multiFilters as $field => $values) {
            $builder->whereIn($field, $values);
        }

        return $this->paginateBuilder($builder, $page, $limit, $sort, $order);
    }

    /**
     * Busca textual paginada com OR LIKE nos campos de $searchFields.
     */
    public function searchByTermView(string $term, int $page, int $limit, string $sort, string $order): array
    {
        $builder = $this->db->table($this->table);

        if ($term !== '' && !empty($this->searchFields)) {
            $builder->groupStart();
            foreach ($this->searchFields as $i => $field) {
                if ($i === 0) {
                    $builder->like($field, $term);
                } else {
                    $builder->orLike($field, $term);
                }
            }
            $builder->groupEnd();
        }

        return $this->paginateBuilder($builder, $page, $limit, $sort, $order);
    }

    /**
     * Lista paginada de registros com deleted_at IS NOT NULL.
     */
    public function findDeletedPaginatedView(int $page, int $limit, string $sort, string $order): array
    {
        $builder = $this->db->table($this->table)->where('deleted_at IS NOT NULL', null, false);

        return $this->paginateBuilder($builder, $page, $limit, $sort, $order);
    }

    /**
     * Lista paginada de todos os registros (ativos + soft-deleted).
     */
    public function findAllWithDeletedPaginatedView(int $page, int $limit, string $sort, string $order): array
    {
        return $this->paginateBuilder($this->db->table($this->table), $page, $limit, $sort, $order);
    }

    // -------------------------------------------------------------------------
    // Leitura por ID
    // -------------------------------------------------------------------------

    /**
     * Busca registro ativo pelo ID (sem filtro de deleted_at).
     */
    public function findById(int $id): ?array
    {
        $row = $this->db->table($this->table)
            ->where($this->primaryKey, $id)
            ->get()
            ->getRowArray();

        return $row ?: null;
    }

    /**
     * Busca registro soft-deleted pelo ID.
     */
    public function findDeletedById(int $id): ?array
    {
        $row = $this->db->table($this->table)
            ->where($this->primaryKey, $id)
            ->where('deleted_at IS NOT NULL', null, false)
            ->get()
            ->getRowArray();

        return $row ?: null;
    }

    // -------------------------------------------------------------------------
    // Leitura sem paginação
    // -------------------------------------------------------------------------

    /**
     * Retorna registros ordenados, sem paginação.
     * Se $limit for informado (>= 1), aplica LIMIT no SQL; caso contrário retorna tudo.
     */
    public function findAllView(string $sort, string $order, ?int $limit = null): array
    {
        $builder = $this->db->table($this->table)
            ->orderBy($this->safeSort($sort), $this->safeOrder($order));

        if ($limit !== null && $limit >= 1) {
            $builder->limit($limit);
        }

        return $builder->get()->getResultArray();
    }
}
