<?php

namespace App\Services\V1\BootstrapIcons;

use App\Models\V1\BootstrapIcons\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo BootstrapIcons.
 *
 * CRUD generico vem de BaseTableService. Este Processor garante unicidade de
 * name (validateOnCreate / validateOnUpdate).
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

    protected function validateOnCreate(array $data): ?array
    {
        if (!empty($data['name']) && $this->tableModel->existsByName((string) $data['name'])) {
            return ['success' => false, 'message' => 'name ja utilizado por outro icone', 'code' => 409];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (!empty($data['name']) && $this->tableModel->existsByName((string) $data['name'], $id)) {
            return ['success' => false, 'message' => 'name ja utilizado por outro icone', 'code' => 409];
        }

        return null;
    }
}
