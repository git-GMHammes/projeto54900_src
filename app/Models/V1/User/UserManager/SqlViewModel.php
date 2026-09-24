<?php

namespace App\Models\V1\User\UserManager;

use App\Models\V1\BaseViewModel;

/**
 * Model de leitura para a view view_user_manager.
 *
 * A view une user_manager (um) com user_profiles (uc) e user_roles (ur).
 *
 * Prefixos na view:
 *   um_ = user_manager  (username, status, user_role_id, last_login_at)
 *   uc_ = user_profiles (name, email, phone, whatsapp, cpf, cep, address, uuid)
 *   ur_ = user_roles    (role_slug, role_name, role_id, role_description — perfil 1:1 ligado por user_role_id)
 *
 * O campo deleted_at reflete user_manager.deleted_at.
 *
 * Todos os métodos de leitura genéricos estão disponíveis via BaseViewModel.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_user_manager';
    protected $primaryKey = 'id';

    /**
     * Campos de texto que usam LIKE %valor% no findPaginatedView.
     */
    protected array $likeFields = [
        'um_username',
        'uc_name',
        'uc_email',
        'uc_cpf',
        'uc_phone',
        'uc_whatsapp',
        'uc_cep',
        'uc_address',
        'ur_role_slug',
        'ur_role_name',
        'ur_role_description',
    ];

    /** Campos válidos para ordenação */
    protected array $sortableFields = [
        'id',
        'um_username',
        'um_status',
        'um_user_role_id',
        'um_last_login_at',
        'uc_name',
        'uc_email',
        'uc_cpf',
        'ur_role_slug',
        'ur_role_id',
        'created_at',
        'updated_at',
    ];

    /** Campos utilizados na busca textual (GET /search) */
    public array $searchFields = [
        'um_username',
        'uc_name',
        'uc_email',
        'uc_cpf',
        'uc_phone',
        'uc_whatsapp',
        'uc_address',
        'ur_role_slug',
        'ur_role_name',
        'ur_role_description',
    ];

    /** Filtros exatos aceitos junto da busca (GET /search?filters[um_status]=active) */
    public array $filterFields = [
        'um_status',
    ];
}
