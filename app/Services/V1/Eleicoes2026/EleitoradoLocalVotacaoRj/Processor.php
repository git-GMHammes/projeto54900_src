<?php

namespace App\Services\V1\Eleicoes2026\EleitoradoLocalVotacaoRj;

use App\Models\V1\Eleicoes2026\EleitoradoLocalVotacaoRj\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service do modulo Eleicoes2026/EleitoradoLocalVotacaoRj — eleitorado por local de votacao 2026 (RJ).
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
