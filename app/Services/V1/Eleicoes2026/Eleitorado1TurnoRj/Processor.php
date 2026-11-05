<?php

namespace App\Services\V1\Eleicoes2026\Eleitorado1TurnoRj;

use App\Models\V1\Eleicoes2026\Eleitorado1TurnoRj\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service do modulo Eleicoes2026/Eleitorado1TurnoRj — eleitorado do 1o turno 2026 (RJ), por secao eleitoral.
 *
 * Somente leitura: as rotas de escrita nao sao registradas (ver EndpointTable.php). A leitura generica
 * (find, getGrouped, search, get, getAll, getNoPagination, getDeleted...) vem de BaseTableService.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
    }
}
