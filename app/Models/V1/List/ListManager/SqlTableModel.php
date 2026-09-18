<?php

namespace App\Models\V1\List\ListManager;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela list_manager.
 *
 * Tabela: list_manager
 * DDL: id (BIGINT PK auto), slug (unique), table_name, title, description,
 *      api_get_endpoint, api_search_endpoint, roles,
 *      default_sort (default 'id'), default_order (enum asc/desc, default desc),
 *      default_limit (default 20), limit_options_json,
 *      status (enum draft/active/inactive, default draft), version (default 1),
 *      created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'list_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'slug',
        'table_name',
        'title',
        'description',
        'api_get_endpoint',
        'api_search_endpoint',
        'roles',
        'default_sort',
        'default_order',
        'default_limit',
        'limit_options_json',
        'status',
        'version',
    ];

    protected array $likeFields = [
        'slug',
        'title',
        'api_get_endpoint',
        'roles',
    ];

    protected array $sortableFields = [
        'id',
        'slug',
        'title',
        'status',
        'default_limit',
        'version',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'slug',
        'title',
        'description',
        'api_get_endpoint',
    ];

    /**
     * Alias semantico sobre existsByField para a coluna slug.
     *
     * @param string   $slug      Slug a verificar
     * @param int|null $excludeId ID a ignorar (usado no update)
     */
    public function existsBySlug(string $slug, ?int $excludeId = null): bool
    {
        return $this->existsByField('slug', $slug, $excludeId);
    }
}
