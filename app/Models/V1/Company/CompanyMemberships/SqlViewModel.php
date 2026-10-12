<?php

namespace App\Models\V1\Company\CompanyMemberships;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_company_memberships — uma empresa por linha, com
 * members_count e members_names (so vinculos ativos). `members_search` (nome, usuario e
 * telefone em digitos dos membros) so serve a busca. Somente leitura.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: so a empresa da sessao (id = empresa da sessao). */
    protected string $companyScope = 'self';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_company_memberships';
    protected $primaryKey = 'id';

    protected array $likeFields = ['co_name', 'co_slug', 'co_document', 'members_names', 'members_search'];

    protected array $sortableFields = [
        'id', 'co_name', 'co_slug', 'co_status', 'members_count', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['co_name', 'co_slug', 'co_document', 'members_names', 'members_search'];

    public array $filterFields = ['co_status'];
}
