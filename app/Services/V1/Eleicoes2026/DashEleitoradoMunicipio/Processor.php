<?php

namespace App\Services\V1\Eleicoes2026\DashEleitoradoMunicipio;

use App\Models\V1\Eleicoes2026\DashEleitoradoMunicipio\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service do modulo Eleicoes2026/DashEleitoradoMunicipio — Eleitorado por municipio.
 *
 * Somente leitura sobre a view view_dash_eleitorado_municipio; a leitura generica vem de BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
