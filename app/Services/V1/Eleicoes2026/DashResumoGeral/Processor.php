<?php

namespace App\Services\V1\Eleicoes2026\DashResumoGeral;

use App\Models\V1\Eleicoes2026\DashResumoGeral\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service do modulo Eleicoes2026/DashResumoGeral — Resumo geral do estado: votos por cargo, eleitorado, secoes, locais, municipios, zonas e bairros.
 *
 * Somente leitura sobre a view view_dash_resumo_geral; a leitura generica vem de BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
