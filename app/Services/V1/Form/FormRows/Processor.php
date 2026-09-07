<?php

namespace App\Services\V1\Form\FormRows;

use App\Models\V1\Form\FormGroups\SqlTableModel as FormGroupsModel;
use App\Models\V1\Form\FormRows\SqlTableModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Form/FormRows.
 *
 * CRUD generico vem de BaseTableService. Este Processor valida a existencia do
 * form_group_id (FK ativa). A regra "1 a 12 campos por linha" (contagem e soma
 * dos `col`) e aplicada no modulo Form/FormCampos, quando o campo e vinculado
 * a linha.
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    private FormGroupsModel $formGroupsModel;

    public function __construct()
    {
        $this->tableModel      = new SqlTableModel();
        $this->formGroupsModel = new FormGroupsModel();
    }

    protected function validateOnCreate(array $data): ?array
    {
        $formGroupId = (int) ($data['form_group_id'] ?? 0);

        if ($formGroupId < 1 || !$this->formGroupsModel->find($formGroupId)) {
            return ['success' => false, 'message' => 'form_group_id nao encontrado', 'code' => 422];
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if (!array_key_exists('form_group_id', $data)) {
            return null;
        }

        $formGroupId = (int) $data['form_group_id'];

        if ($formGroupId < 1 || !$this->formGroupsModel->find($formGroupId)) {
            return ['success' => false, 'message' => 'form_group_id nao encontrado', 'code' => 422];
        }

        return null;
    }
}
