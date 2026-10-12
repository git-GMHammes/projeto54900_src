<?php

namespace App\Models\V1\Map\MapPostalCodes;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_map_postal_codes — base de CEP (logradouro, bairro, cidade) com coordenada.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_map_postal_codes';
    protected $primaryKey = 'id';

    protected array $likeFields = ['cep', 'street', 'neighborhood', 'city'];

    protected array $sortableFields = [
        'id', 'cep', 'street', 'neighborhood', 'city', 'state', 'source', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['cep', 'street', 'neighborhood', 'city'];

    public array $filterFields = ['state', 'source'];
}
