<?php

namespace App\Services\V1\Form\FormGroups;

use App\Models\V1\Form\FormGroups\SqlTableModel;
use App\Models\V1\Form\FormManager\SqlTableModel as FormManagerModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Form/FormGroups.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - valida a existencia do form_manager_id (FK ativa)
 *  - garante unicidade de slug dentro do mesmo formulario
 *    (form_manager_id + slug)
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    private FormManagerModel $formManagerModel;

    public function __construct()
    {
        $this->tableModel       = new SqlTableModel();
        $this->formManagerModel = new FormManagerModel();
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $formManagerId = (int) ($data['form_manager_id'] ?? 0);

        if ($formManagerId < 1 || !$this->formManagerModel->find($formManagerId)) {
            return ['success' => false, 'message' => 'form_manager_id nao encontrado', 'code' => 422];
        }

        if (
            !empty($data['slug'])
            && $this->tableModel->existsBySlugInForm($formManagerId, (string) $data['slug'])
        ) {
            return ['success' => false, 'message' => 'slug ja utilizado neste formulario', 'code' => 409];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $current = $this->tableModel->find($id);
        if (!$current) {
            return null; // inexistencia e tratada por BaseTableService::update
        }

        $formManagerId = (int) ($data['form_manager_id'] ?? $current['form_manager_id']);

        if (array_key_exists('form_manager_id', $data)) {
            if ($formManagerId < 1 || !$this->formManagerModel->find($formManagerId)) {
                return ['success' => false, 'message' => 'form_manager_id nao encontrado', 'code' => 422];
            }
        }

        $slug = $data['slug'] ?? $current['slug'];
        if (
            !empty($slug)
            && $this->tableModel->existsBySlugInForm($formManagerId, (string) $slug, $id)
        ) {
            return ['success' => false, 'message' => 'slug ja utilizado neste formulario', 'code' => 409];
        }

        return null;
    }
}
