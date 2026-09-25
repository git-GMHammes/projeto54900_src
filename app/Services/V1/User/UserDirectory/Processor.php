<?php

namespace App\Services\V1\User\UserDirectory;

use App\Models\V1\User\UserDirectory\SqlViewModel;
use App\Services\V1\BaseViewService;

/**
 * Service de leitura para o diretório mínimo de usuários (view_user_directory).
 *
 * Sem hooks de validação/preparação — toda a lógica genérica de leitura de
 * view já está em BaseViewService.
 */
class Processor extends BaseViewService
{
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->viewModel = new SqlViewModel();
    }
}
