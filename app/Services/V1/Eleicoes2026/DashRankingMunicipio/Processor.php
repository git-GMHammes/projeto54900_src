<?php

namespace App\Services\V1\Eleicoes2026\DashRankingMunicipio;

use App\Models\V1\Eleicoes2026\DashRankingMunicipio\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service do modulo Eleicoes2026/DashRankingMunicipio — Ranking de municipios por votos do candidato 22001 e por cargo.
 *
 * Somente leitura sobre a view view_dash_ranking_municipio; a leitura generica vem de BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
