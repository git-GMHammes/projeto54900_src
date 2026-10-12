<?php

namespace App\Models\V1\Map\MapAddresses;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_map_addresses — endereco estruturado e georreferenciado.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de map_addresses for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'map_addresses';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_map_addresses';
    protected $primaryKey = 'id';

    protected array $likeFields = ['ma_cep', 'ma_street', 'ma_neighborhood', 'ma_city', 'ma_display_name'];

    protected array $sortableFields = [
        'id', 'ma_cep', 'ma_street', 'ma_city', 'ma_state', 'ma_geocode_source', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['ma_cep', 'ma_street', 'ma_neighborhood', 'ma_city', 'ma_display_name'];

    public array $filterFields = ['ma_state', 'ma_geocode_source', 'ma_map_postal_code_id'];
}
