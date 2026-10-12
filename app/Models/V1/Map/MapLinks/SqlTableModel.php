<?php

namespace App\Models\V1\Map\MapLinks;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela map_links — vinculo universal modulo <-> mapa (CEP, endereco, ponto ou rota).
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'map_links';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'module',
        'reference_id',
        'collection',
        'link_type',
        'map_postal_code_id',
        'map_address_id',
        'map_point_id',
        'map_route_id',
        'label',
        'sort_order',
        'status',
        'user_manager_id',
    ];

    protected array $likeFields = ['module', 'collection', 'label'];

    protected array $sortableFields = [
        'id', 'module', 'reference_id', 'collection', 'link_type', 'map_postal_code_id', 'map_address_id', 'map_point_id', 'map_route_id', 'label', 'sort_order', 'status', 'user_manager_id', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['module', 'collection', 'label'];
}
