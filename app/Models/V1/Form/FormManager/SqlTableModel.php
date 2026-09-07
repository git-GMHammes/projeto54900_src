<?php

namespace App\Models\V1\Form\FormManager;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela form_manager.
 *
 * Tabela: form_manager
 * DDL: id (BIGINT PK auto), name, slug (unique), title, subtitle, description,
 *      profile_group, react_route, submit_endpoint, http_method (default 'POST'),
 *      status (enum draft/active/inactive, default draft), version (default 1),
 *      settings_json (JSON), created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'form_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    /** Nenhum segredo nesta tabela. */
    protected $hidden = [];

    /**
     * Campos inseriveis/atualizaveis via Model. Exclui id e timestamps.
     */
    protected $allowedFields = [
        'name',
        'slug',
        'title',
        'subtitle',
        'description',
        'profile_group',
        'react_route',
        'submit_endpoint',
        'http_method',
        'status',
        'version',
        'settings_json',
    ];

    /** Campos de texto que usam LIKE %valor% no find. */
    protected array $likeFields = [
        'name',
        'slug',
        'title',
        'profile_group',
        'react_route',
    ];

    /** Campos validos para ORDER BY (whitelist anti-SQL-injection). */
    protected array $sortableFields = [
        'id',
        'name',
        'slug',
        'profile_group',
        'status',
        'version',
        'created_at',
        'updated_at',
    ];

    /** Campos varridos pelo GET /search. */
    public array $searchFields = [
        'name',
        'slug',
        'title',
        'subtitle',
        'description',
        'profile_group',
        'react_route',
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
