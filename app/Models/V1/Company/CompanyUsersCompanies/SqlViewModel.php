<?php

namespace App\Models\V1\Company\CompanyUsersCompanies;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_company_users_companies — um usuario por linha, com
 * companies_count e companies_names (so vinculos ativos). Sem dados pessoais
 * alem de nome e e-mail. Somente leitura.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a view traz company_id (um registro por usuario membro e empresa). */
    protected string $companyScope = 'column';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_company_users_companies';
    protected $primaryKey = 'id';

    protected array $likeFields = ['um_username', 'uc_name', 'uc_email', 'companies_names'];

    protected array $sortableFields = [
        'id', 'um_username', 'um_status', 'uc_name', 'companies_count', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['um_username', 'uc_name', 'uc_email', 'companies_names'];

    public array $filterFields = ['um_status'];
}
