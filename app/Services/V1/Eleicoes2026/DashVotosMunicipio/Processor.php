<?php

namespace App\Services\V1\Eleicoes2026\DashVotosMunicipio;

use App\Models\V1\Eleicoes2026\DashVotosMunicipio\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service do modulo Eleicoes2026/DashVotosMunicipio — Votos do candidato 22001 e eleitorado por municipio e cargo.
 *
 * Somente leitura sobre a view view_dash_votos_municipio; a leitura generica vem de BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
