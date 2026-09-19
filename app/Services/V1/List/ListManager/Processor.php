<?php

namespace App\Services\V1\List\ListManager;

use App\Models\V1\List\ListManager\SqlTableModel;
use App\Services\V1\BaseTableService;
use App\Services\V1\Meta\DbSchema\SchemaInspector;

/**
 * Service de negocio do modulo List/ListManager.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - garante unicidade de slug (validateOnCreate / validateOnUpdate)
 *  - garante que table_name e uma tabela/view real do schema (validateOnCreate / validateOnUpdate)
 *  - sela o status no create (nasce 'draft', DEFAULT da coluna)
 *  - serializa limit_options_json quando chega como array
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;

    private SchemaInspector $schemaInspector;

    private const JSON_COLUMNS = [
        'limit_options_json',
    ];

    public function __construct()
    {
        $this->tableModel      = new SqlTableModel();
        $this->schemaInspector = new SchemaInspector();
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        if (!empty($data['slug']) && $this->tableModel->existsBySlug((string) $data['slug'])) {
            return ['success' => false, 'message' => 'slug ja utilizado por outra listagem', 'code' => 409];
        }

        if (!empty($data['table_name']) && !$this->schemaInspector->isKnownTable((string) $data['table_name'])) {
            return ['success' => false, 'message' => "table_name '{$data['table_name']}' nao encontrada no schema", 'code' => 422];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (!empty($data['slug']) && $this->tableModel->existsBySlug((string) $data['slug'], $id)) {
            return ['success' => false, 'message' => 'slug ja utilizado por outra listagem', 'code' => 409];
        }

        if (!empty($data['table_name']) && !$this->schemaInspector->isKnownTable((string) $data['table_name'])) {
            return ['success' => false, 'message' => "table_name '{$data['table_name']}' nao encontrada no schema", 'code' => 422];
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Hooks de preparacao de dados
    // -------------------------------------------------------------------------

    protected function prepareData(array $data): array
    {
        // status nunca vem do cliente no create — usa o DEFAULT da coluna ('draft').
        unset($data['status']);

        return $this->encodeJsonColumns($data);
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        // status E mutavel via update — nao delega para prepareData (que o remove).
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
