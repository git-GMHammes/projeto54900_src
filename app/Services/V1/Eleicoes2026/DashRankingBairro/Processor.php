<?php

namespace App\Services\V1\Eleicoes2026\DashRankingBairro;

use App\Models\V1\Eleicoes2026\DashRankingBairro\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service do modulo Eleicoes2026/DashRankingBairro — Ranking de bairros por votos do candidato 22001 e por cargo.
 *
 * Somente leitura sobre a view view_dash_ranking_bairro; a leitura generica vem de BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
