<?php

namespace App\Services\V1\Eleicoes2026\DashVotosLocalVotacao;

use App\Models\V1\Eleicoes2026\DashVotosLocalVotacao\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service do modulo Eleicoes2026/DashVotosLocalVotacao — Votos do candidato 22001 e eleitorado por local de votacao e cargo.
 *
 * Somente leitura sobre a view view_dash_votos_local_votacao; a leitura generica vem de BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
