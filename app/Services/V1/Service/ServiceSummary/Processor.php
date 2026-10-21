<?php

namespace App\Services\V1\Service\ServiceSummary;

use App\Models\V1\Service\ServiceSummary\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service somente leitura sobre view_service_summary (resumo por servico).
 *
 * orders_open conta pedidos requested/quoted/accepted/scheduled/in_progress; revenue soma o
 * final_price (ou quoted_price) dos concluidos; orders_late = abertos com deadline_at vencido.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
