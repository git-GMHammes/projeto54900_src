<?php

namespace App\Services\V1\Form\FormManager;

use App\Models\V1\Form\FormManager\SqlTableModel;
use App\Models\V1\Form\FormManager\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Form/FormManager.
 *
 * Todo o CRUD generico (leitura, escrita, exclusao) e as leituras de view vem
 * de BaseTableService / BaseViewService. Este Processor:
 *  - garante unicidade de slug (validateOnCreate / validateOnUpdate)
 *  - sela o status no create (nasce 'draft', DEFAULT da coluna)
 *  - serializa settings_json quando chega como objeto/array
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

    /** Colunas JSON desta tabela. */
    private const JSON_COLUMNS = ['settings_json'];

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        if (!empty($data['slug']) && $this->tableModel->existsBySlug((string) $data['slug'])) {
            return ['success' => false, 'message' => 'slug ja utilizado por outro formulario', 'code' => 409];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (!empty($data['slug']) && $this->tableModel->existsBySlug((string) $data['slug'], $id)) {
            return ['success' => false, 'message' => 'slug ja utilizado por outro formulario', 'code' => 409];
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
        // status E mutavel via update — mantido.
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
