<?php

namespace App\Services\V1\Form\FormCampos;

use App\Models\V1\Form\FormCampos\SqlTableModel;
use App\Models\V1\Form\FormRows\SqlTableModel as FormRowsModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Form/FormCampos.
 *
 * CRUD generico vem de BaseTableService. Este Processor:
 *  - valida a existencia do form_row_id (FK ativa)
 *  - aplica a regra do grid: no maximo 12 campos por linha E soma dos `col`
 *    dos campos ativos da linha <= 12
 *  - serializa as colunas JSON (options_json, datalist_json,
 *    allowed_domains_json, select_config_json, style_json, attributes_json)
 *    quando chegam como array/objeto
 *
 * Metodos herdados: find, getGrouped, search, get, getAll, getNoPagination,
 *   getDeleted, getWithDeleted, getDeletedAll, getAllWithDeleted, create,
 *   update, deleteSoft, deleteRestore, deleteHard, clearDeleted.
 */
class Processor extends BaseTableService
{
    protected SqlTableModel $tableModel;
    private FormRowsModel $formRowsModel;

    private const MAX_COLS         = 12;
    private const MAX_CAMPOS_LINHA = 12;

    private const JSON_COLUMNS = [
        'options_json',
        'datalist_json',
        'allowed_domains_json',
        'select_config_json',
        'style_json',
        'attributes_json',
    ];

    public function __construct()
    {
        $this->tableModel    = new SqlTableModel();
        $this->formRowsModel = new FormRowsModel();
    }

    // -------------------------------------------------------------------------
    // Hooks de validacao
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $formRowId = (int) ($data['form_row_id'] ?? 0);

        if ($formRowId < 1 || !$this->formRowsModel->find($formRowId)) {
            return ['success' => false, 'message' => 'form_row_id nao encontrado', 'code' => 422];
        }

        $col = (int) ($data['col'] ?? self::MAX_COLS);

        return $this->validarGrid($formRowId, $col, null);
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $current = $this->tableModel->find($id);
        if (!$current) {
            return null; // inexistencia e tratada por BaseTableService::update
        }

        $formRowId = (int) ($data['form_row_id'] ?? $current['form_row_id']);

        if (array_key_exists('form_row_id', $data)) {
            if ($formRowId < 1 || !$this->formRowsModel->find($formRowId)) {
                return ['success' => false, 'message' => 'form_row_id nao encontrado', 'code' => 422];
            }
        }

        $col = (int) ($data['col'] ?? $current['col']);

        return $this->validarGrid($formRowId, $col, $id);
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
     * Verifica o teto de 12 na linha: contagem de campos e soma dos `col`.
     * $excludeCampoId ignora o proprio campo (usado no update).
     */
    private function validarGrid(int $formRowId, int $col, ?int $excludeCampoId): ?array
    {
        if ($col < 1 || $col > self::MAX_COLS) {
            return ['success' => false, 'message' => 'col deve estar entre 1 e 12', 'code' => 422];
        }

        $qtd = $this->formRowsModel->countCampos($formRowId, $excludeCampoId);
        if ($qtd + 1 > self::MAX_CAMPOS_LINHA) {
            return ['success' => false, 'message' => 'a linha ja possui 12 campos', 'code' => 409];
        }

        $soma = $this->formRowsModel->sumCampoCols($formRowId, $excludeCampoId);
        if ($soma + $col > self::MAX_COLS) {
            return [
                'success' => false,
                'message' => "a soma das colunas (col) da linha excede 12 (atual {$soma}, +{$col})",
                'code'    => 409,
            ];
        }

        return null;
    }

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
