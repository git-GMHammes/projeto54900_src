<?php

namespace App\Services\V1\User\UserRoles;

use App\Models\V1\User\UserRoles\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo User/UserRoles (read-only).
 *
 * Todo o CRUD generico vem de BaseTableService. Este modulo so expoe rotas de
 * leitura (ver Config/Routes/Api/v1/User/UserRoles/EndpointTable.php), entao
 * nao ha hooks de validacao/preparacao aqui. Nao usa view (sem $viewModel).
 *
 * Metodos herdados usados: find, getGrouped, search, get, getAll, getNoPagination.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
    }
}
