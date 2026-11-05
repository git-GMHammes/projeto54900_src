<?php

namespace App\Services\V1\Eleicoes2026\Candidato22001Municipio;

use App\Models\V1\Eleicoes2026\Candidato22001Municipio\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service do modulo Eleicoes2026/Candidato22001Municipio — votos do candidato 22001 somados por municipio e cargo.
 *
 * Somente leitura sobre a view view_eleicoes_2026_22001_22_municipio; a leitura generica vem de BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
