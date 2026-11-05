<?php

namespace App\Services\V1\Eleicoes2026\DashEleitoradoZona;

use App\Models\V1\Eleicoes2026\DashEleitoradoZona\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service do modulo Eleicoes2026/DashEleitoradoZona — Eleitorado por municipio e zona.
 *
 * Somente leitura sobre a view view_dash_eleitorado_zona; a leitura generica vem de BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
