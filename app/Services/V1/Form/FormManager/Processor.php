<?php

namespace App\Services\V1\Form\FormManager;

use App\Models\V1\Form\FormManager\SqlTableModel;
use App\Models\V1\Form\FormManager\SqlViewModel;
use App\Services\V1\BaseTableService;
use App\Services\V1\Meta\DbSchema\SchemaInspector;

/**
 * Service de negocio do modulo Form/FormManager.
 *
 * Todo o CRUD generico (leitura, escrita, exclusao) e as leituras de view vem
 * de BaseTableService / BaseViewService. Este Processor:
 *  - garante unicidade de slug (validateOnCreate / validateOnUpdate)
 *  - garante que table_name e uma tabela real do schema (validateOnCreate / validateOnUpdate)
 *  - sela o status no create (nasce 'draft', DEFAULT da coluna)
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted
 *   (+ versoes *View para a view_form_manager).
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    protected SqlViewModel  $viewModel;

    private SchemaInspector $schemaInspector;

    public function __construct()
    {
        $this->tableModel      = new SqlTableModel();
        $this->viewModel       = new SqlViewModel();
        $this->schemaInspector = new SchemaInspector();
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        if (!empty($data['slug']) && $this->tableModel->existsBySlug((string) $data['slug'])) {
            return ['success' => false, 'message' => 'slug ja utilizado por outro formulario', 'code' => 409];
        }

        if (!empty($data['table_name']) && !$this->schemaInspector->isKnownTable((string) $data['table_name'])) {
            return ['success' => false, 'message' => "table_name '{$data['table_name']}' nao encontrada no schema", 'code' => 422];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (!empty($data['slug']) && $this->tableModel->existsBySlug((string) $data['slug'], $id)) {
            return ['success' => false, 'message' => 'slug ja utilizado por outro formulario', 'code' => 409];
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

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        // status E mutavel via update — nao delega para prepareData (que o remove).
        return $data;
    }
}
