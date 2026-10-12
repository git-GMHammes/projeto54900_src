<?php

namespace App\Models\V1\User\UserResourceAccess;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela user_resource_access — permissao INDIVIDUAL de um usuario
 * a um form ou list, independente da empresa.
 *
 * DDL: id (BIGINT PK auto), user_manager_id (FK user_manager), resource_type
 *      ENUM('form','list'), resource_id (id em form_manager/list_manager, sem FK
 *      por ser polimorfico), allowed TINYINT(1) default 1, created_at,
 *      updated_at, deleted_at. UNIQUE (user_manager_id, resource_type, resource_id).
 */
class SqlTableModel extends BaseTableModel
{
    /** Permissoes de acesso so de usuarios membros da empresa da sessao (company_members). */
    protected string $companyScope = 'membership';
    protected array $membershipStatuses = ['active', 'pending', 'blocked'];
    protected string $membershipKey = 'user_manager_id';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'user_resource_access';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'user_manager_id',
        'resource_type',
        'resource_id',
        'allowed',
    ];

    protected array $likeFields = ['resource_type'];

    protected array $sortableFields = [
        'id', 'user_manager_id', 'resource_type', 'resource_id', 'allowed',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['resource_type'];

    /**
     * Linha do usuario para o recurso (ativa), ou null.
     */
    public function findByUserAndResource(int $userId, string $type, int $resourceId): ?array
    {
        return $this->where('user_manager_id', $userId)
            ->where('resource_type', $type)
            ->where('resource_id', $resourceId)
            ->first();
    }
}
