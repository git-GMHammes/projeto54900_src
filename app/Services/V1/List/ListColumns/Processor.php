<?php

namespace App\Services\V1\List\ListColumns;

use App\Models\V1\List\ListColumns\SqlTableModel;
use App\Models\V1\List\ListManager\SqlTableModel as ListManagerModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo List/ListColumns.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - valida a existencia do list_manager_id (FK ativa)
 *  - serializa as colunas JSON (concat_json, sort_concat_json) quando chegam
 *    como array/objeto
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    private ListManagerModel $listManagerModel;

    private const JSON_COLUMNS = [
        'concat_json',
        'sort_concat_json',
    ];

    public function __construct()
    {
        $this->tableModel       = new SqlTableModel();
        $this->listManagerModel = new ListManagerModel();
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $listManagerId = (int) ($data['list_manager_id'] ?? 0);

        if ($listManagerId < 1 || !$this->listManagerModel->find($listManagerId)) {
            return ['success' => false, 'message' => 'list_manager_id nao encontrado', 'code' => 422];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (!array_key_exists('list_manager_id', $data)) {
            return null;
        }

        $listManagerId = (int) $data['list_manager_id'];

        if ($listManagerId < 1 || !$this->listManagerModel->find($listManagerId)) {
            return ['success' => false, 'message' => 'list_manager_id nao encontrado', 'code' => 422];
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Hooks de preparacao de dados
    // -------------------------------------------------------------------------

    protected function prepareData(array $data): array
    {
        return $this->encodeJsonColumns($data);
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        return $this->encodeJsonColumns($data);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Converte para string JSON as colunas JSON recebidas como array/objeto.
     * Strings sao mantidas como vieram (assume-se JSON ja valido).
     */
    private function encodeJsonColumns(array $data): array
    {
        foreach (self::JSON_COLUMNS as $col) {
            if (isset($data[$col]) && \is_array($data[$col])) {
                $data[$col] = json_encode($data[$col], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            }
        }

        return $data;
    }
}
