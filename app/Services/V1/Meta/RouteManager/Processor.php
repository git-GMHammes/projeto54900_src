<?php

namespace App\Services\V1\Meta\RouteManager;

use App\Models\V1\Meta\RouteManager\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Meta/RouteManager.
 *
 * Todo o CRUD generico (leitura, escrita, exclusao) vem de BaseTableService.
 * Este Processor garante unicidade de (method, endpoint) no create/update.
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
        if (
            !empty($data['method']) && !empty($data['endpoint'])
            && $this->tableModel->existsByMethodEndpoint((string) $data['method'], (string) $data['endpoint'])
        ) {
            return ['success' => false, 'message' => 'ja existe uma rota cadastrada com esse method+endpoint', 'code' => 409];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (
            !empty($data['method']) && !empty($data['endpoint'])
            && $this->tableModel->existsByMethodEndpoint((string) $data['method'], (string) $data['endpoint'], $id)
        ) {
            return ['success' => false, 'message' => 'ja existe uma rota cadastrada com esse method+endpoint', 'code' => 409];
        }

        return null;
    }
}
