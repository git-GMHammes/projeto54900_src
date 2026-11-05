<?php

namespace App\Services\V1\Eleicoes2026\DashEleitoradoBairro;

use App\Models\V1\Eleicoes2026\DashEleitoradoBairro\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service do modulo Eleicoes2026/DashEleitoradoBairro — Eleitorado por municipio e bairro.
 *
 * Somente leitura sobre a view view_dash_eleitorado_bairro; a leitura generica vem de BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
