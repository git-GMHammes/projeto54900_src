<?php

namespace App\Services\V1\Eleicoes2026\Candidato22001;

use App\Models\V1\Eleicoes2026\Candidato22001\SqlTableModel;
use App\Models\V1\Eleicoes2026\Candidato22001\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service do modulo Eleicoes2026/Candidato22001 — votos do candidato 22001 (RJ, 1o e 2o turno 2026).
 *
 * Somente leitura: tabela eleicoes_2026_votos_1t_2t_22001_RJ e view view_eleicoes_2026_22001_22. As rotas de escrita
 * nao sao registradas (ver EndpointTable.php). A leitura generica vem de BaseTableService.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
    }
}
