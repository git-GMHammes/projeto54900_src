<?php

namespace App\Services\V1\Eleicoes2026\DashVotosPartido;

use App\Models\V1\Eleicoes2026\DashVotosPartido\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service do modulo Eleicoes2026/DashVotosPartido — Votos do candidato 22001 por cargo e partido.
 *
 * Somente leitura sobre a view view_dash_votos_partido; a leitura generica vem de BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
