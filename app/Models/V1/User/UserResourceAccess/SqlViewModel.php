<?php

namespace App\Models\V1\User\UserResourceAccess;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_user_resource_access — permissao + usuario (user_manager/
 * user_profiles) + slug/titulo do form ou list referenciado.
 *
 * Somente leitura.
 */
class SqlViewModel extends BaseViewModel
{
    /** Permissoes de acesso so de usuarios membros da empresa da sessao (company_members). */
    protected string $companyScope = 'membership';
    protected array $membershipStatuses = ['active', 'pending', 'blocked'];
    protected string $membershipKey = 'ura_user_manager_id';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_user_resource_access';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'ura_resource_type', 'resource_type_label', 'access_label', 'resource_slug', 'resource_title',
        'um_username', 'uc_name', 'uc_email',
    ];

    protected array $sortableFields = [
        'id', 'ura_user_manager_id', 'ura_resource_type', 'ura_resource_id', 'ura_allowed',
        'resource_slug', 'resource_title', 'access_label', 'resource_type_label', 'um_username', 'uc_name',
        'created_at', 'updated_at',
    ];

    public array $searchFields = [
        'ura_resource_type', 'resource_slug', 'resource_title',
        'um_username', 'uc_name', 'uc_email',
    ];

    public array $filterFields = ['ura_resource_type', 'ura_allowed', 'ura_user_manager_id'];
}
