<?php

namespace App\Models\V1\Map\MapPoints;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_map_points — pontos no mapa.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de map_points for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'map_points';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_map_points';
    protected $primaryKey = 'id';

    protected array $likeFields = ['pt_name', 'pt_description', 'mc_name', 'ma_street', 'ma_city'];

    protected array $sortableFields = [
        'id', 'pt_map_manager_id', 'pt_map_category_id', 'pt_name', 'pt_lat', 'pt_lng', 'pt_status', 'mc_name', 'ma_city', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['pt_name', 'pt_description', 'mc_name', 'ma_street', 'ma_city'];

    public array $filterFields = ['pt_map_manager_id', 'pt_map_category_id', 'pt_status', 'ma_state'];
}
