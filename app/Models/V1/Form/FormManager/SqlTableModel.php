<?php

namespace App\Models\V1\Form\FormManager;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela form_manager.
 *
 * Tabela: form_manager
 * DDL: id (BIGINT PK auto), slug (unique), table_name (tabela real do banco
 *      escolhida no construtor — validada contra o schema no Processor), title,
 *      description, roles, react_route, submit_endpoint,
 *      http_method (default 'POST'), status (enum draft/active/inactive,
 *      default draft), version (default 1), created_at, updated_at, deleted_at.
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
        'slug',
        'table_name',
        'title',
        'description',
        'roles',
        'react_route',
        'submit_endpoint',
        'http_method',
        'status',
        'version',
    ];

    /** Campos de texto que usam LIKE %valor% no find. */
    protected array $likeFields = [
        'slug',
        'table_name',
        'title',
        'roles',
        'react_route',
    ];

    /** Campos validos para ORDER BY (whitelist anti-SQL-injection). */
    protected array $sortableFields = [
        'id',
        'slug',
        'table_name',
        'roles',
        'status',
        'version',
        'created_at',
        'updated_at',
    ];

    /** Campos varridos pelo GET /search. */
    public array $searchFields = [
        'slug',
        'table_name',
        'title',
        'description',
        'roles',
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
