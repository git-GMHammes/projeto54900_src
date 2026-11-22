<?php

namespace App\Services\V1\Sgd\Documents;

use App\Models\V1\Sgd\Documents\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service do modulo SGD / documentos escaneados. CRUD generico vem de BaseTableService.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
    }
}
