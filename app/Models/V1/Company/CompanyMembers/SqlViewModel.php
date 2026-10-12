<?php

namespace App\Models\V1\Company\CompanyMembers;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_company_members — vinculo + empresa + usuario.
 * Somente leitura. O escopo (empresas do usuario) e do Processor.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: o vinculo (company_members.id) tem de ser da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'company_members';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_company_members';
    protected $primaryKey = 'id';

    protected array $likeFields = ['co_name', 'co_slug', 'um_username', 'uc_name', 'uc_email'];

    protected array $sortableFields = [
        'id', 'cm_company_id', 'cm_user_manager_id', 'cm_role', 'cm_status',
        'co_name', 'um_username', 'uc_name', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['co_name', 'co_slug', 'um_username', 'uc_name', 'uc_email'];

    public array $filterFields = ['cm_company_id', 'cm_user_manager_id', 'cm_role', 'cm_status'];
}
