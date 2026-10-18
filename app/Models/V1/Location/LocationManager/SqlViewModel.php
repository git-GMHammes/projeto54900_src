<?php

namespace App\Models\V1\Location\LocationManager;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_location_manager — local com tipo, profundidade e caminho completo.
 *
 * Descendentes de um local: filtrar por root_id ou parent_id; a busca textual
 * varre path_names (o nome de qualquer ancestral acha todos os descendentes).
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de location_manager for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'location_manager';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_location_manager';
    protected $primaryKey = 'id';

    protected array $likeFields = ['name', 'code', 'path_names', 'type_name'];

    protected array $sortableFields = [
        'id', 'parent_id', 'location_type_id', 'name', 'code', 'type_name', 'sort_order', 'status', 'root_id', 'depth', 'children_count', 'path_names', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['name', 'code', 'type_name', 'path_names'];

    public array $filterFields = ['parent_id', 'root_id', 'location_type_id', 'type_code', 'depth', 'status'];
}
