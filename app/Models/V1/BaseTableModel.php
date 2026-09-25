<?php

namespace App\Models\V1;

use CodeIgniter\Model;

/**
 * Model base para leitura e escrita em tabelas físicas na API V1.
 *
 * Fornece todos os métodos de consulta usados por BaseTableService:
 *   findPaginated, findGrouped, searchByTerm, getOrdered,
 *   findDeletedPaginated, findAllWithDeletedPaginated,
 *   findOnlyDeleted, findWithDeleted, restore, clearDeleted, existsByField
 *
 * Classes filhas devem declarar:
 *   $DBGroup, $table, $primaryKey, $useSoftDeletes, $useTimestamps,
 *   $allowedFields, $likeFields, $sortableFields, $searchFields
 */
abstract class BaseTableModel extends Model
{
    /** Campos que usam LIKE %valor% em findPaginated quando presentes nos filtros. */
    protected array $likeFields = [];

    /** Campos permitidos para ORDER BY — protege contra SQL injection. */
    protected array $sortableFields = [];

    /** Campos usados na busca textual (searchByTerm). */
    public array $searchFields = [];

    /**
     * Callbacks after* ativados: garante que find()/findAll()/first() também
     * removam os campos de $hidden mesmo com retorno em array.
     */
    protected $allowCallbacks = true;
    protected $afterFind      = ['stripHiddenAfterFind'];

    /**
     * Callback afterFind — remove $this->hidden do payload retornado por
     * find()/findAll()/first() (usados por BaseTableService::get/create/update).
     */
    protected function stripHiddenAfterFind(array $eventData): array
    {
        if (empty($this->hidden) || !isset($eventData['data'])) {
            return $eventData;
        }

        $data = $eventData['data'];

        if ($data === null) {
            return $eventData;
        }

        if (\is_array($data) && array_is_list($data)) {
            $eventData['data'] = array_map(
                fn ($row) => \is_array($row) ? $this->hideFields($row) : $row,
                $data
            );
        } elseif (\is_array($data)) {
            $eventData['data'] = $this->hideFields($data);
        }

        return $eventData;
    }

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
     * Remove de uma linha os campos listados em $this->hidden.
     *
     * O $hidden nativo do CodeIgniter\Model só age quando o retorno é objeto/entity.
     * As consultas desta classe usam Query Builder cru (getResultArray/getRowArray),
     * então a proteção precisa ser aplicada aqui — cobre password_hash, token, etc.
     */
    protected function hideFields(?array $row): ?array
    {
        if ($row === null || empty($this->hidden)) {
            return $row;
        }

        foreach ($this->hidden as $field) {
            unset($row[$field]);
        }

        return $row;
    }

    /**
     * Aplica hideFields() a uma lista de linhas.
     */
    protected function hideFieldsList(array $rows): array
    {
        if (empty($this->hidden)) {
            return $rows;
        }

        return array_map(fn (array $row): array => $this->hideFields($row) ?? [], $rows);
    }

    /**
     * Executa COUNT + resultado paginado sobre o builder recebido.
     */
    protected function paginateBuilder(object $builder, int $page, int $limit, string $sort, string $order): array
    {
        $total = $builder->countAllResults(false);

        $rows = $builder
            ->orderBy($this->safeSort($sort), $this->safeOrder($order))
            ->limit($limit, ($page - 1) * $limit)
            ->get()
            ->getResultArray();

        return [
            'data'       => $this->hideFieldsList($rows),
            'pagination' => [
                'page'  => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => $total > 0 ? (int) ceil($total / $limit) : 0,
            ],
        ];
    }

    /**
     * Aplica o filtro de soft delete (WHERE deleted_at IS NULL) quando habilitado.
     */
    protected function applyActiveScopeToBuilder(object $builder): object
    {
        if ($this->useSoftDeletes) {
            $builder->where($this->deletedField . ' IS NULL', null, false);
        }

        return $builder;
    }

    /**
     * Aplica filtros ao builder: LIKE para campos em $likeFields, WHERE exato para os demais.
     */
    private function applyFilters(object $builder, array $filters): object
    {
        foreach ($filters as $field => $value) {
            if (\in_array($field, $this->likeFields, true)) {
                $builder->like($field, $value);
            } else {
                $builder->where($field, $value);
            }
        }

        return $builder;
    }

    /**
     * Restringe o builder a um subconjunto de IDs (WHERE IN), quando informado.
     * Usado pelos Processors para aplicar regras de dono/convite/organizador
     * sobre os métodos genéricos de leitura e exclusão em massa.
     */
    private function applyIdRestriction(object $builder, ?array $restrictToIds): object
    {
        if ($restrictToIds !== null) {
            $builder->whereIn($this->primaryKey, $restrictToIds);
        }

        return $builder;
    }

    // -------------------------------------------------------------------------
    // Leitura paginada (registros ativos)
    // -------------------------------------------------------------------------

    /**
     * Consulta paginada com filtros exatos (ou LIKE para campos em $likeFields).
     * Respeita soft delete quando habilitado.
     */
    public function findPaginated(array $filters, int $page, int $limit, string $sort, string $order, ?array $restrictToIds = null): array
    {
        $builder = $this->db->table($this->table);
        $this->applyActiveScopeToBuilder($builder);
        $this->applyFilters($builder, $filters);
        $this->applyIdRestriction($builder, $restrictToIds);

        return $this->paginateBuilder($builder, $page, $limit, $sort, $order);
    }

    /**
     * Consulta paginada com filtros multivalorados (WHERE IN).
     * Respeita soft delete quando habilitado.
     *
     * @param array $multiFilters Mapa [campo => array_de_valores]
     */
    public function findGrouped(array $multiFilters, int $page, int $limit, string $sort, string $order): array
    {
        $builder = $this->db->table($this->table);
        $this->applyActiveScopeToBuilder($builder);

        foreach ($multiFilters as $field => $values) {
            $builder->whereIn($field, $values);
        }

        return $this->paginateBuilder($builder, $page, $limit, $sort, $order);
    }

    /**
     * Busca textual paginada com OR LIKE nos campos fornecidos.
     * Respeita soft delete quando habilitado.
     *
     * @param array $searchFields Campos para busca (normalmente $this->tableModel->searchFields)
     */
    public function searchByTerm(string $term, array $searchFields, int $page, int $limit, string $sort, string $order, ?array $restrictToIds = null): array
    {
        $builder = $this->db->table($this->table);
        $this->applyActiveScopeToBuilder($builder);

        if ($term !== '' && !empty($searchFields)) {
            $builder->groupStart();
            foreach ($searchFields as $i => $field) {
                if ($i === 0) {
                    $builder->like($field, $term);
                } else {
                    $builder->orLike($field, $term);
                }
            }
            $builder->groupEnd();
        }

        $this->applyIdRestriction($builder, $restrictToIds);

        return $this->paginateBuilder($builder, $page, $limit, $sort, $order);
    }

    /**
     * Lista paginada de registros soft-deleted.
     */
    public function findDeletedPaginated(int $page, int $limit, string $sort, string $order, ?array $restrictToIds = null): array
    {
        $builder = $this->db->table($this->table)
            ->where($this->deletedField . ' IS NOT NULL', null, false);
        $this->applyIdRestriction($builder, $restrictToIds);

        return $this->paginateBuilder($builder, $page, $limit, $sort, $order);
    }

    /**
     * Lista paginada de todos os registros (ativos + soft-deleted).
     */
    public function findAllWithDeletedPaginated(int $page, int $limit, string $sort, string $order, ?array $restrictToIds = null): array
    {
        $builder = $this->db->table($this->table);
        $this->applyIdRestriction($builder, $restrictToIds);

        return $this->paginateBuilder($builder, $page, $limit, $sort, $order);
    }

    // -------------------------------------------------------------------------
    // Leitura sem paginação
    // -------------------------------------------------------------------------

    /**
     * Retorna registros ativos ordenados, sem paginação.
     * Se $limit for informado (>= 1), aplica LIMIT no SQL; caso contrário retorna tudo.
     * Respeita soft delete quando habilitado.
     */
    public function getOrdered(string $sort, string $order, ?int $limit = null, ?array $restrictToIds = null): array
    {
        $builder = $this->db->table($this->table);
        $this->applyActiveScopeToBuilder($builder);
        $this->applyIdRestriction($builder, $restrictToIds);

        $builder->orderBy($this->safeSort($sort), $this->safeOrder($order));

        if ($limit !== null && $limit >= 1) {
            $builder->limit($limit);
        }

        return $this->hideFieldsList($builder->get()->getResultArray());
    }

    // -------------------------------------------------------------------------
    // Leitura por ID (incluindo deletados)
    // -------------------------------------------------------------------------

    /**
     * Busca registro soft-deleted pelo ID.
     */
    public function findOnlyDeleted(int $id): ?array
    {
        $row = $this->db->table($this->table)
            ->where($this->primaryKey, $id)
            ->where($this->deletedField . ' IS NOT NULL', null, false)
            ->get()
            ->getRowArray();

        return $row ? $this->hideFields($row) : null;
    }

    /**
     * Busca registro pelo ID, independente de estar ativo ou soft-deleted.
     */
    public function findWithDeleted(int $id): ?array
    {
        $row = $this->db->table($this->table)
            ->where($this->primaryKey, $id)
            ->get()
            ->getRowArray();

        return $row ? $this->hideFields($row) : null;
    }

    // -------------------------------------------------------------------------
    // Operações de exclusão/restauração
    // -------------------------------------------------------------------------

    /**
     * Restaura um registro soft-deleted zerando o campo deleted_at.
     */
    public function restore(int $id): void
    {
        $this->db->table($this->table)
            ->where($this->primaryKey, $id)
            ->update([$this->deletedField => null]);
    }

    /**
     * Remove permanentemente do banco todos os registros soft-deleted.
     * Se $id for fornecido, remove apenas aquele registro.
     *
     * @return int Número de linhas afetadas
     */
    public function clearDeleted(?int $id = null, ?array $restrictToIds = null): int
    {
        $builder = $this->db->table($this->table)
            ->where($this->deletedField . ' IS NOT NULL', null, false);

        if ($id !== null) {
            $builder->where($this->primaryKey, $id);
        }
        $this->applyIdRestriction($builder, $restrictToIds);

        $builder->delete();

        return $this->db->affectedRows();
    }

    // -------------------------------------------------------------------------
    // Verificação de unicidade
    // -------------------------------------------------------------------------

    /**
     * Verifica se já existe registro com o campo=valor, excluindo opcionalmente um ID.
     * Ignora registros soft-deleted.
     *
     * @param string   $field     Nome da coluna
     * @param mixed    $value     Valor a verificar
     * @param int|null $excludeId ID a excluir da busca (para edição)
     */
    public function existsByField(string $field, mixed $value, ?int $excludeId = null): bool
    {
        $builder = $this->db->table($this->table)->where($field, $value);

        if ($this->useSoftDeletes) {
            $builder->where($this->deletedField . ' IS NULL', null, false);
        }

        if ($excludeId !== null) {
            $builder->where($this->primaryKey . ' !=', $excludeId);
        }

        return $builder->countAllResults() > 0;
    }
}
