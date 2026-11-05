<?php

namespace App\Services\V1\Eleicoes2026\DashVotosBairro;

use App\Models\V1\Eleicoes2026\DashVotosBairro\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service do modulo Eleicoes2026/DashVotosBairro — Votos do candidato 22001 e eleitorado por municipio, bairro e cargo.
 *
 * Somente leitura sobre a view view_dash_votos_bairro; a leitura generica vem de BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
