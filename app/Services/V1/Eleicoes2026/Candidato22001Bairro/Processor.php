<?php

namespace App\Services\V1\Eleicoes2026\Candidato22001Bairro;

use App\Models\V1\Eleicoes2026\Candidato22001Bairro\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service do modulo Eleicoes2026/Candidato22001Bairro — votos do candidato 22001 somados por municipio, bairro e cargo.
 *
 * Somente leitura sobre a view view_eleicoes_2026_22001_22_bairro; a leitura generica vem de BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
