<?php

namespace App\Models\V1\User\UserManager;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita para a tabela user_manager.
 *
 * Responsável por todas as operações CRUD diretas na tabela física.
 *
 * Tabela: user_manager
 * DDL: id (BIGINT PK auto), username (unique), password_hash, token (nullable),
 *      status (enum active/inactive/blocked, default active),
 *      user_role_id (BIGINT NULL, FK -> user_roles.id, ON DELETE SET NULL),
 *      last_login_at, created_at, updated_at, deleted_at
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'user_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    /**
     * Campos excluídos de qualquer retorno de consulta via Model.
     * Evita exposição acidental do hash de senha e do token nas respostas da API.
     */
    protected $hidden = [
        'password_hash',
        'token',
    ];

    /**
     * Campos que podem ser inseridos/atualizados via Model.
     * Exclui: id (PK), created_at/updated_at/deleted_at (timestamps).
     */
    protected $allowedFields = [
        'username',
        'password_hash',
        'token',
        'status',
        'user_role_id',
        'last_login_at',
    ];

    /**
     * Campos de texto que usam LIKE %valor% no find.
     */
    protected array $likeFields = [
        'username',
    ];

    /** Campos válidos para ordenação */
    protected array $sortableFields = [
        'id',
        'username',
        'status',
        'user_role_id',
        'last_login_at',
        'created_at',
        'updated_at',
    ];

    /** Campos utilizados na busca textual (GET /search) */
    public array $searchFields = [
        'username',
    ];

    /**
     * Alias semântico para existsByField aplicado ao campo 'username'.
     *
     * @param string   $username  Username a verificar
     * @param int|null $excludeId ID a ignorar (usado no update)
     */
    public function existsByUsername(string $username, ?int $excludeId = null): bool
    {
        return $this->existsByField('username', $username, $excludeId);
    }
}
