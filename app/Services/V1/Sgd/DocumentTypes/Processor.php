<?php

namespace App\Services\V1\Sgd\DocumentTypes;

use App\Models\V1\Sgd\DocumentTypes\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service do modulo SGD / tipos de documento. CRUD generico vem de BaseTableService.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
    }
}
