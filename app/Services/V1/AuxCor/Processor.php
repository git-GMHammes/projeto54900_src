<?php

namespace App\Services\V1\AuxCor;

use App\Models\V1\AuxCor\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo AuxCor.
 *
 * CRUD generico vem de BaseTableService. Este Processor garante unicidade de
 * name e hexadecimal (validateOnCreate / validateOnUpdate).
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
        return $this->checkUnique($data, null);
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        return $this->checkUnique($data, $id);
    }

    private function checkUnique(array $data, ?int $excludeId): ?array
    {
        if (!empty($data['name']) && $this->tableModel->existsByName((string) $data['name'], $excludeId)) {
            return ['success' => false, 'message' => 'name ja utilizado por outra cor', 'code' => 409];
        }

        if (!empty($data['hexadecimal']) && $this->tableModel->existsByHexadecimal((string) $data['hexadecimal'], $excludeId)) {
            return ['success' => false, 'message' => 'hexadecimal ja utilizado por outra cor', 'code' => 409];
        }

        return null;
    }
}
