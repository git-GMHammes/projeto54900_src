<?php

namespace App\Models\V1\Map\MapPostalCodes;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela map_postal_codes — base de CEP (logradouro, bairro, cidade) com coordenada.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'map_postal_codes';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'cep',
        'street',
        'neighborhood',
        'city',
        'state',
        'ibge_code',
        'lat',
        'lng',
        'source',
    ];

    protected array $likeFields = ['cep', 'street', 'neighborhood', 'city', 'ibge_code'];

    protected array $sortableFields = [
        'id', 'cep', 'street', 'neighborhood', 'city', 'state', 'ibge_code', 'lat', 'lng', 'source', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['cep', 'street', 'neighborhood', 'city', 'ibge_code'];
}
