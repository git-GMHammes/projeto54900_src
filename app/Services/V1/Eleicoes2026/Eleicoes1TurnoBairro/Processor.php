<?php

namespace App\Services\V1\Eleicoes2026\Eleicoes1TurnoBairro;

use App\Models\V1\Eleicoes2026\Eleicoes1TurnoBairro\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service do modulo Eleicoes2026/Eleicoes1TurnoBairro — secao eleitoral x municipio x bairro (1o turno 2026).
 *
 * Somente leitura sobre a view view_eleicoes_2026_1_turno_bairro; a leitura generica vem de BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
