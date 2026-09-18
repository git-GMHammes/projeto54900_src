<?php

namespace App\Models\V1\Meta\RouteManager;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela route_manager.
 *
 * Tabela: route_manager
 * DDL: id (BIGINT PK auto), layer (enum backend/frontend), object, action,
 *      method (enum GET/POST/PUT/PATCH/DELETE), endpoint, controller_method,
 *      created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'route_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    /** Nenhum segredo nesta tabela. */
    protected $hidden = [];

    /**
     * Campos inseriveis/atualizaveis via Model. Exclui id e timestamps.
     */
    protected $allowedFields = [
        'layer',
        'object',
        'action',
        'method',
        'endpoint',
        'controller_method',
    ];

    /** Campos de texto que usam LIKE %valor% no find. */
    protected array $likeFields = [
        'object',
        'action',
        'endpoint',
        'controller_method',
    ];

    /** Campos validos para ORDER BY (whitelist anti-SQL-injection). */
    protected array $sortableFields = [
        'id',
        'layer',
        'object',
        'action',
        'method',
        'endpoint',
        'created_at',
        'updated_at',
    ];

    /** Campos varridos pelo GET /search. */
    public array $searchFields = [
        'object',
        'action',
        'endpoint',
        'controller_method',
    ];

    /**
     * Verifica se ja existe rota cadastrada com o mesmo method+endpoint.
     *
     * @param int|null $excludeId ID a ignorar (usado no update)
     */
    public function existsByMethodEndpoint(string $method, string $endpoint, ?int $excludeId = null): bool
    {
        $builder = $this->db->table($this->table)
            ->where('method', $method)
            ->where('endpoint', $endpoint);

        if ($this->useSoftDeletes) {
            $builder->where($this->deletedField . ' IS NULL', null, false);
        }

        if ($excludeId !== null) {
            $builder->where($this->primaryKey . ' !=', $excludeId);
        }

        return $builder->countAllResults() > 0;
    }
}
