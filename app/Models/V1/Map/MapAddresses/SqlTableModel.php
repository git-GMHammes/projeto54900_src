<?php

namespace App\Models\V1\Map\MapAddresses;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela map_addresses — endereco estruturado e georreferenciado.
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'map_addresses';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'map_postal_code_id',
        'cep',
        'street',
        'number',
        'complement',
        'neighborhood',
        'city',
        'state',
        'country',
        'lat',
        'lng',
        'geocode_source',
        'geocode_precision',
        'osm_type',
        'osm_id',
        'display_name',
    ];

    protected array $likeFields = ['cep', 'street', 'number', 'complement', 'neighborhood', 'city', 'osm_type', 'display_name'];

    protected array $sortableFields = [
        'id', 'map_postal_code_id', 'cep', 'street', 'number', 'complement', 'neighborhood', 'city', 'state', 'country', 'lat', 'lng', 'geocode_source', 'geocode_precision', 'osm_type', 'osm_id', 'display_name', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['cep', 'street', 'number', 'complement', 'neighborhood', 'city', 'osm_type', 'display_name'];
}
