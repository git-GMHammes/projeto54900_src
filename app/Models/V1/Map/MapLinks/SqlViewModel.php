<?php

namespace App\Models\V1\Map\MapLinks;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_map_links — vinculo universal modulo <-> mapa (CEP, endereco, ponto ou rota).
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de map_links for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'map_links';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_map_links';
    protected $primaryKey = 'id';

    protected array $likeFields = ['ml_module', 'ml_collection', 'ml_label', 'pt_name', 'rt_name', 'ad_street', 'pc_cep'];

    protected array $sortableFields = [
        'id', 'ml_module', 'ml_reference_id', 'ml_collection', 'ml_link_type', 'ml_sort_order', 'ml_status', 'pt_name', 'rt_name', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['ml_module', 'ml_collection', 'ml_label', 'pt_name', 'rt_name', 'ad_street', 'pc_cep'];

    public array $filterFields = ['ml_module', 'ml_reference_id', 'ml_collection', 'ml_link_type', 'ml_status', 'ml_user_manager_id'];
}
