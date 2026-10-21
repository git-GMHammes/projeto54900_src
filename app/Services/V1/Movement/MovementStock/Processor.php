<?php

namespace App\Services\V1\Movement\MovementStock;

use App\Models\V1\Movement\MovementStock\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service somente leitura sobre view_movement_stock (saldo por produto).
 *
 *   saldo       = entradas - saidas - desperdicios (status done)
 *   reservado   = separacoes abertas
 *   encomendado = encomendas abertas
 *   disponivel  = saldo - reservado
 *   below_min   = 1 quando stock_min existe e disponivel < stock_min
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
