<?php

namespace App\Services\V1\Nav\NavManager;

use App\Models\V1\Nav\NavManager\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Nav/NavManager.
 *
 * CRUD generico vem de BaseTableService. Este Processor apenas garante que
 * o status nunca seja definido pelo cliente no create (nasce do DEFAULT da
 * coluna, 'draft').
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
    }

    // -------------------------------------------------------------------------
    // Hook de preparacao de dados
    // -------------------------------------------------------------------------

    protected function prepareData(array $data): array
    {
        // status nunca e definido pelo cliente no create - o DEFAULT da coluna
        // ('draft') decide o status de toda nova config de nav.
        unset($data['status']);

        return $data;
    }
}
