<?php

namespace App\Models\V1\User\UserRoles;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela user_roles — perfis de acesso (admin, user, guest).
 *
 * Usada pelo modulo User/UserRoles (API V1), CRUD completo. Tambem alimenta
 * selects como o campo "Grupo de perfil" do FormBuilderPage.
 *
 * Tabela: user_roles
 * DDL: id (BIGINT PK auto), name (VARCHAR 100), slug (VARCHAR 100 UNIQUE),
 *      description (VARCHAR 255 NULL), permissions (JSON NULL),
 *      status (TINYINT 1, default 1), created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'user_roles';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    /** Nenhum segredo nesta tabela. */
    protected $hidden = [];

    /** Campos inseriveis/atualizaveis via Model. Exclui id e timestamps. */
    protected $allowedFields = [
        'name',
        'slug',
        'description',
        'permissions',
        'status',
    ];

    /** Campos de texto que usam LIKE %valor% no find. */
    protected array $likeFields = [
        'name',
        'slug',
        'description',
    ];

    /** Campos validos para ORDER BY (whitelist anti-SQL-injection). */
    protected array $sortableFields = [
        'id',
        'name',
        'slug',
        'status',
        'created_at',
        'updated_at',
    ];

    /** Campos varridos pelo GET /search. */
    public array $searchFields = [
        'name',
        'slug',
        'description',
    ];

    /**
     * Alias semantico sobre existsByField para a coluna slug.
     *
     * @param string   $slug      Slug a verificar
     * @param int|null $excludeId ID a ignorar
     */
    public function existsBySlug(string $slug, ?int $excludeId = null): bool
    {
        return $this->existsByField('slug', $slug, $excludeId);
    }
}
