<?php

namespace App\Models\V1\User\UserProfiles;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita para a tabela user_profiles.
 *
 * Responsável por todas as operações CRUD diretas na tabela física.
 *
 * Tabela: user_profiles
 * DDL: id (BIGINT PK auto), user_manager_id (BIGINT, FK -> user_manager.id, ON DELETE CASCADE),
 *      uuid (VARCHAR(50) NULL), name (VARCHAR(255) NOT NULL),
 *      phone (VARCHAR(20) NULL), whatsapp (VARCHAR(20) NULL),
 *      email (VARCHAR(255) NULL UNIQUE), cpf (VARCHAR(14) NULL),
 *      cep (VARCHAR(9) NULL), address (VARCHAR(255) NULL),
 *      created_at, updated_at, deleted_at
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'user_profiles';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    /**
     * Campos que podem ser inseridos/atualizados via Model.
     * Exclui: id (PK), created_at/updated_at/deleted_at (timestamps).
     */
    protected $allowedFields = [
        'user_manager_id',
        'uuid',
        'name',
        'phone',
        'whatsapp',
        'email',
        'cpf',
        'cep',
        'address',
    ];

    /**
     * Campos de texto que usam LIKE %valor% no find.
     */
    protected array $likeFields = [
        'name',
        'email',
        'address',
    ];

    /** Campos válidos para ordenação */
    protected array $sortableFields = [
        'id',
        'user_manager_id',
        'name',
        'email',
        'created_at',
        'updated_at',
    ];

    /** Campos utilizados na busca textual (GET /search) */
    public array $searchFields = [
        'name',
        'email',
    ];

    /**
     * Alias semântico para existsByField aplicado ao campo 'email'.
     *
     * @param string   $email     Email a verificar
     * @param int|null $excludeId ID a ignorar (usado no update)
     */
    public function existsByEmail(string $email, ?int $excludeId = null): bool
    {
        return $this->existsByField('email', $email, $excludeId);
    }
}
